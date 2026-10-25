#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    Address, BytesN, Env, String,
};
use treasury_vault::TreasuryVaultContractClient;

const TREASURY_VAULT_WASM: &[u8] =
    include_bytes!("../../../target/wasm32v1-none/release/treasury_vault.wasm");

#[test]
fn test_factory_deploy_subsidiaries() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_700_000_000);

    let factory_admin = Address::generate(&env);
    let tag = symbol_short!("VAULT_V1");

    // 1. Upload treasury_vault.wasm to Soroban test host
    let wasm_hash = env.deployer().upload_contract_wasm(TREASURY_VAULT_WASM);

    // 2. Deploy VaultFactoryContract with initial executable ref
    let factory_id = env.register(
        VaultFactoryContract,
        (&factory_admin, &tag, &wasm_hash),
    );
    let factory_client = VaultFactoryContractClient::new(&env, &factory_id);

    // Verify initial executable ref
    let resolved_hash = factory_client.get_executable_ref(&tag).unwrap();
    assert_eq!(resolved_hash, wasm_hash);

    // 3. Deploy Lisbon HQ Subsidiary Vault
    let lisbon_admin = Address::generate(&env);
    let lisbon_token = Address::generate(&env);
    let lisbon_salt = BytesN::from_array(&env, &[1u8; 32]);
    let lisbon_name = String::from_str(&env, "Portus Lisbon HQ");
    let lisbon_jurisdiction = String::from_str(&env, "EU-PT");

    let lisbon_vault_address = factory_client.deploy_subsidiary_vault(
        &factory_admin,
        &symbol_short!("LISBON_HQ"),
        &lisbon_name,
        &lisbon_jurisdiction,
        &tag,
        &lisbon_admin,
        &lisbon_token,
        &lisbon_salt,
    );

    // Verify Lisbon child contract works!
    let lisbon_vault_client = TreasuryVaultContractClient::new(&env, &lisbon_vault_address);
    let lisbon_meta = lisbon_vault_client.get_vault_meta();
    assert_eq!(lisbon_meta.owner, lisbon_admin);
    assert_eq!(lisbon_meta.primary_token, lisbon_token);
    assert_eq!(lisbon_meta.subsidiary_name, lisbon_name);
    assert_eq!(lisbon_meta.total_settled_count, 0);

    // 4. Deploy Frankfurt Subsidiary Vault
    let frankfurt_admin = Address::generate(&env);
    let frankfurt_token = Address::generate(&env);
    let frankfurt_salt = BytesN::from_array(&env, &[2u8; 32]);
    let frankfurt_name = String::from_str(&env, "Portus Frankfurt GmbH");
    let frankfurt_jurisdiction = String::from_str(&env, "EU-DE");

    let frankfurt_vault_address = factory_client.deploy_subsidiary_vault(
        &factory_admin,
        &symbol_short!("FRAN_EUR"),
        &frankfurt_name,
        &frankfurt_jurisdiction,
        &tag,
        &frankfurt_admin,
        &frankfurt_token,
        &frankfurt_salt,
    );

    // Verify Frankfurt child contract works!
    let frankfurt_vault_client =
        TreasuryVaultContractClient::new(&env, &frankfurt_vault_address);
    let frankfurt_meta = frankfurt_vault_client.get_vault_meta();
    assert_eq!(frankfurt_meta.owner, frankfurt_admin);
    assert_eq!(frankfurt_meta.primary_token, frankfurt_token);
    assert_eq!(frankfurt_meta.subsidiary_name, frankfurt_name);

    // 5. Verify list_subsidiaries
    let fleet = factory_client.list_subsidiaries();
    assert_eq!(fleet.len(), 2);

    let rec0 = &fleet.get(0).unwrap();
    assert_eq!(rec0.subsidiary_code, symbol_short!("LISBON_HQ"));
    assert_eq!(rec0.vault_address, lisbon_vault_address);
    assert_eq!(rec0.executable_tag, tag);
    assert_eq!(rec0.wasm_hash, wasm_hash);

    let rec1 = &fleet.get(1).unwrap();
    assert_eq!(rec1.subsidiary_code, symbol_short!("FRAN_EUR"));
    assert_eq!(rec1.vault_address, frankfurt_vault_address);
    assert_eq!(rec1.executable_tag, tag);
    assert_eq!(rec1.wasm_hash, wasm_hash);

    // 6. Test rotating / registering a new executable ref tag
    let new_tag = symbol_short!("VAULT_V2");
    let new_wasm_hash = BytesN::from_array(&env, &[99u8; 32]);
    factory_client.register_executable_ref(&factory_admin, &new_tag, &new_wasm_hash);

    let resolved_v2 = factory_client.get_executable_ref(&new_tag).unwrap();
    assert_eq!(resolved_v2, new_wasm_hash);
}

#[test]
fn test_factory_rejections() {
    let env = Env::default();
    env.mock_all_auths();

    let factory_admin = Address::generate(&env);
    let tag = symbol_short!("VAULT_V1");
    let wasm_hash = env.deployer().upload_contract_wasm(TREASURY_VAULT_WASM);

    let factory_id = env.register(
        VaultFactoryContract,
        (&factory_admin, &tag, &wasm_hash),
    );
    let factory_client = VaultFactoryContractClient::new(&env, &factory_id);

    // Rejection on non-existent executable tag
    let bad_tag = symbol_short!("NONEXIST");
    let salt = BytesN::from_array(&env, &[5u8; 32]);
    let err = factory_client.try_deploy_subsidiary_vault(
        &factory_admin,
        &symbol_short!("SUB_FAIL"),
        &String::from_str(&env, "Fail"),
        &String::from_str(&env, "EU"),
        &bad_tag,
        &Address::generate(&env),
        &Address::generate(&env),
        &salt,
    );
    assert_eq!(err, Err(Ok(FactoryError::ExecutableNotFound.into())));
}
