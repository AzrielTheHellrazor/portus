#![cfg(test)]

use super::*;
use p256::ecdsa::SigningKey;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient},
    Address, BytesN, Env, String, Vec,
};

fn setup_vault(
    env: &Env,
) -> (
    TreasuryVaultContractClient<'_>,
    Address, // admin
    Address, // sac token
    Address, // vault contract address
) {
    env.ledger().set_timestamp(1_700_000_000);
    let admin = Address::generate(env);
    let token_issuer = Address::generate(env);
    let sac = env.register_stellar_asset_contract_v2(token_issuer.clone());
    let primary_token = sac.address();

    let name = String::from_str(env, "Lisbon HQ");
    let contract_id = env.register(TreasuryVaultContract, (&admin, &primary_token, &name));
    let client = TreasuryVaultContractClient::new(env, &contract_id);

    // Mint some initial primary tokens to the vault
    let asset_admin = StellarAssetClient::new(env, &primary_token);
    asset_admin.mint(&contract_id, &100_000_0000000);

    (client, admin, primary_token, contract_id)
}

#[test]
fn test_basic_initialization() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, primary_token, _) = setup_vault(&env);

    let meta = client.get_vault_meta();
    assert_eq!(meta.owner, admin);
    assert_eq!(meta.primary_token, primary_token);
    assert_eq!(meta.subsidiary_name, String::from_str(&env, "Lisbon HQ"));
    assert_eq!(meta.paused, false);
    assert_eq!(meta.cfo_passkey_registered, false);
    assert_eq!(meta.total_settled_count, 0);
    assert_eq!(meta.total_usdc_volume_stroops, 0);
}

#[test]
fn test_p256_passkey_signing_and_verification() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, _, _) = setup_vault(&env);

    // Generate deterministic P-256 keypair
    let signing_key = SigningKey::from_slice(&[42u8; 32]).unwrap();
    let verifying_key = signing_key.verifying_key();
    let point = verifying_key.to_encoded_point(false);
    assert_eq!(point.as_bytes().len(), 65);
    assert_eq!(point.as_bytes()[0], 4);

    let pubkey_bytes: [u8; 65] = point.as_bytes().try_into().unwrap();
    let pubkey = BytesN::from_array(&env, &pubkey_bytes);

    // Register passkey
    client.register_cfo_passkey(&admin, &pubkey);

    let meta = client.get_vault_meta();
    assert!(meta.cfo_passkey_registered);

    // Create 32-byte digest
    let digest_bytes = [99u8; 32];
    let payload_digest = BytesN::from_array(&env, &digest_bytes);

    // Sign prehash and normalize to low-s
    let (mut sig, _) = signing_key.sign_prehash_recoverable(&digest_bytes).unwrap();
    sig = sig.normalize_s().unwrap_or(sig);
    let sig_bytes: [u8; 64] = sig.to_bytes().into();
    let signature = BytesN::from_array(&env, &sig_bytes);

    let verified = client.verify_cfo_passkey(&payload_digest, &signature);
    assert!(verified);
}

#[test]
fn test_upsert_policy_cap_0086_sparse_fields() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, _, _) = setup_vault(&env);
    let spender = Address::generate(&env);
    let merchant = Address::generate(&env);

    let mut merchants = Vec::new(&env);
    merchants.push_back(merchant.clone());

    // Policy 1: Sparse fields populated (Some)
    let policy1 = SpendPolicyData {
        policy_id: symbol_short!("ENG_OPS"),
        label: String::from_str(&env, "Engineering Cloud Services"),
        role: symbol_short!("HUMAN"),
        spender: spender.clone(),
        daily_limit_stroops: 50_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: Some(10_000_0000000),
        cost_center: Some(String::from_str(&env, "CC-ENG-402")),
        period_reset_ts: 0,
        allowed_merchants: merchants.clone(),
        is_active: true,
    };

    client.upsert_policy(&admin, &policy1);

    let saved1 = client.get_policy(&symbol_short!("ENG_OPS")).unwrap();
    assert_eq!(saved1.policy_id, symbol_short!("ENG_OPS"));
    assert_eq!(saved1.daily_limit_stroops, 50_000_0000000);
    assert_eq!(saved1.max_single_tx_stroops, Some(10_000_0000000));
    assert_eq!(saved1.cost_center, Some(String::from_str(&env, "CC-ENG-402")));
    assert!(saved1.period_reset_ts > 0);

    // Policy 2: Sparse fields None
    let policy2 = SpendPolicyData {
        policy_id: symbol_short!("AGNT_SW"),
        label: String::from_str(&env, "Autonomous Swarm Spender"),
        role: symbol_short!("AGENT"),
        spender: spender.clone(),
        daily_limit_stroops: 10_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: None,
        cost_center: None,
        period_reset_ts: 0,
        allowed_merchants: merchants,
        is_active: true,
    };

    client.upsert_policy(&admin, &policy2);

    let saved2 = client.get_policy(&symbol_short!("AGNT_SW")).unwrap();
    assert_eq!(saved2.policy_id, symbol_short!("AGNT_SW"));
    assert_eq!(saved2.max_single_tx_stroops, None);
    assert_eq!(saved2.cost_center, None);

    let all_policies = client.list_policies();
    assert_eq!(all_policies.len(), 2);
}

#[test]
fn test_upsert_policy_with_passkey() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, _, _) = setup_vault(&env);
    let spender = Address::generate(&env);
    let merchant = Address::generate(&env);

    let signing_key = SigningKey::from_slice(&[77u8; 32]).unwrap();
    let point = signing_key.verifying_key().to_encoded_point(false);
    let pubkey_bytes: [u8; 65] = point.as_bytes().try_into().unwrap();
    let pubkey = BytesN::from_array(&env, &pubkey_bytes);

    client.register_cfo_passkey(&admin, &pubkey);

    let mut merchants = Vec::new(&env);
    merchants.push_back(merchant);

    let policy = SpendPolicyData {
        policy_id: symbol_short!("CFO_AUTH"),
        label: String::from_str(&env, "CFO Hardware Gated"),
        role: symbol_short!("AGENT"),
        spender,
        daily_limit_stroops: 100_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: None,
        cost_center: None,
        period_reset_ts: 0,
        allowed_merchants: merchants,
        is_active: true,
    };

    let digest_bytes = [123u8; 32];
    let payload_digest = BytesN::from_array(&env, &digest_bytes);
    let (mut sig, _) = signing_key.sign_prehash_recoverable(&digest_bytes).unwrap();
    sig = sig.normalize_s().unwrap_or(sig);
    let sig_bytes: [u8; 64] = sig.to_bytes().into();
    let signature = BytesN::from_array(&env, &sig_bytes);

    client.upsert_policy_with_passkey(&admin, &policy, &payload_digest, &signature);

    let saved = client.get_policy(&symbol_short!("CFO_AUTH")).unwrap();
    assert_eq!(saved.policy_id, symbol_short!("CFO_AUTH"));
}

#[test]
fn test_update_daily_limit() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, _, _) = setup_vault(&env);
    let spender = Address::generate(&env);
    let merchant = Address::generate(&env);

    let mut merchants = Vec::new(&env);
    merchants.push_back(merchant);

    let policy = SpendPolicyData {
        policy_id: symbol_short!("MKTG"),
        label: String::from_str(&env, "Marketing Daily"),
        role: symbol_short!("HUMAN"),
        spender,
        daily_limit_stroops: 20_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: None,
        cost_center: None,
        period_reset_ts: 0,
        allowed_merchants: merchants,
        is_active: true,
    };

    client.upsert_policy(&admin, &policy);

    let updated = client.update_daily_limit(&admin, &symbol_short!("MKTG"), &45_000_0000000);
    assert_eq!(updated.daily_limit_stroops, 45_000_0000000);

    let saved = client.get_policy(&symbol_short!("MKTG")).unwrap();
    assert_eq!(saved.daily_limit_stroops, 45_000_0000000);
}

#[test]
fn test_authorize_spend_valid_token_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, primary_token, _contract_id) = setup_vault(&env);
    let spender = Address::generate(&env);
    let merchant = Address::generate(&env);

    let mut merchants = Vec::new(&env);
    merchants.push_back(merchant.clone());

    let policy = SpendPolicyData {
        policy_id: symbol_short!("DEV_OPS"),
        label: String::from_str(&env, "DevOps Spend"),
        role: symbol_short!("AGENT"),
        spender: spender.clone(),
        daily_limit_stroops: 10_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: Some(5_000_0000000),
        cost_center: Some(String::from_str(&env, "CC-OPS")),
        period_reset_ts: 0,
        allowed_merchants: merchants,
        is_active: true,
    };
    client.upsert_policy(&admin, &policy);

    let token_client = TokenClient::new(&env, &primary_token);
    let spender_bal_before = token_client.balance(&spender);
    assert_eq!(spender_bal_before, 0);

    let spend_amount = 2_000_0000000;
    let spent_today = client.authorize_spend(
        &symbol_short!("DEV_OPS"),
        &spender,
        &merchant,
        &primary_token,
        &spend_amount,
        &spend_amount,
    );
    assert_eq!(spent_today, spend_amount);

    // Verify token was transferred from vault to spender
    let spender_bal_after = token_client.balance(&spender);
    assert_eq!(spender_bal_after, spend_amount);

    // Verify metadata counters
    let meta = client.get_vault_meta();
    assert_eq!(meta.total_settled_count, 1);
    assert_eq!(meta.total_usdc_volume_stroops, spend_amount);

    // Policy updated
    let policy_after = client.get_policy(&symbol_short!("DEV_OPS")).unwrap();
    assert_eq!(policy_after.spent_today_stroops, spend_amount);
}

#[test]
fn test_authorize_spend_rejections() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, primary_token, _) = setup_vault(&env);
    let spender = Address::generate(&env);
    let whitelisted_merchant = Address::generate(&env);
    let non_whitelisted_merchant = Address::generate(&env);

    let mut merchants = Vec::new(&env);
    merchants.push_back(whitelisted_merchant.clone());

    let policy = SpendPolicyData {
        policy_id: symbol_short!("LIMITS"),
        label: String::from_str(&env, "Limit Testing Policy"),
        role: symbol_short!("AGENT"),
        spender: spender.clone(),
        daily_limit_stroops: 1_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: Some(500_0000000),
        cost_center: None,
        period_reset_ts: 0,
        allowed_merchants: merchants,
        is_active: true,
    };
    client.upsert_policy(&admin, &policy);

    // 1. MerchantNotWhitelisted
    let err_merchant = client.try_authorize_spend(
        &symbol_short!("LIMITS"),
        &spender,
        &non_whitelisted_merchant,
        &primary_token,
        &100_0000000,
        &100_0000000,
    );
    assert_eq!(err_merchant, Err(Ok(VaultError::MerchantNotWhitelisted)));

    // 2. SingleTxLimitExceeded
    let err_single_tx = client.try_authorize_spend(
        &symbol_short!("LIMITS"),
        &spender,
        &whitelisted_merchant,
        &primary_token,
        &600_0000000,
        &600_0000000,
    );
    assert_eq!(err_single_tx, Err(Ok(VaultError::SingleTxLimitExceeded)));

    // 3. DailyLimitExceeded: Spend 500 then 500 = 1000 ok, next spend fails
    let res1 = client.authorize_spend(
        &symbol_short!("LIMITS"),
        &spender,
        &whitelisted_merchant,
        &primary_token,
        &500_0000000,
        &500_0000000,
    );
    assert_eq!(res1, 500_0000000);

    let res2 = client.authorize_spend(
        &symbol_short!("LIMITS"),
        &spender,
        &whitelisted_merchant,
        &primary_token,
        &500_0000000,
        &500_0000000,
    );
    assert_eq!(res2, 1_000_0000000);

    let err_daily = client.try_authorize_spend(
        &symbol_short!("LIMITS"),
        &spender,
        &whitelisted_merchant,
        &primary_token,
        &1_0000000,
        &1_0000000,
    );
    assert_eq!(err_daily, Err(Ok(VaultError::DailyLimitExceeded)));

    // 4. UnauthorizedSpender
    let rogue_spender = Address::generate(&env);
    let err_rogue = client.try_authorize_spend(
        &symbol_short!("LIMITS"),
        &rogue_spender,
        &whitelisted_merchant,
        &primary_token,
        &100_0000000,
        &100_0000000,
    );
    assert_eq!(err_rogue, Err(Ok(VaultError::UnauthorizedSpender)));
}

#[test]
fn test_authorize_spend_vault_paused() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, primary_token, _) = setup_vault(&env);
    let spender = Address::generate(&env);
    let merchant = Address::generate(&env);

    let mut merchants = Vec::new(&env);
    merchants.push_back(merchant.clone());

    let policy = SpendPolicyData {
        policy_id: symbol_short!("PAUSE_TST"),
        label: String::from_str(&env, "Pause Test Policy"),
        role: symbol_short!("HUMAN"),
        spender: spender.clone(),
        daily_limit_stroops: 5_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: None,
        cost_center: None,
        period_reset_ts: 0,
        allowed_merchants: merchants,
        is_active: true,
    };
    client.upsert_policy(&admin, &policy);

    // Pause the vault
    client.set_pause(&admin, &true);
    let meta = client.get_vault_meta();
    assert_eq!(meta.paused, true);

    // Spend attempt while paused fails
    let err_paused = client.try_authorize_spend(
        &symbol_short!("PAUSE_TST"),
        &spender,
        &merchant,
        &primary_token,
        &100_0000000,
        &100_0000000,
    );
    assert_eq!(err_paused, Err(Ok(VaultError::VaultPaused)));

    // Unpause vault
    client.set_pause(&admin, &false);
    assert_eq!(client.get_vault_meta().paused, false);

    // Spend succeeds now
    let spent = client.authorize_spend(
        &symbol_short!("PAUSE_TST"),
        &spender,
        &merchant,
        &primary_token,
        &100_0000000,
        &100_0000000,
    );
    assert_eq!(spent, 100_0000000);
}

#[test]
fn test_rolling_24h_window_reset() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, admin, primary_token, _) = setup_vault(&env);
    let t0 = env.ledger().timestamp();
    let spender = Address::generate(&env);
    let merchant = Address::generate(&env);

    let mut merchants = Vec::new(&env);
    merchants.push_back(merchant.clone());

    let policy = SpendPolicyData {
        policy_id: symbol_short!("ROLL_24H"),
        label: String::from_str(&env, "Rolling Window Policy"),
        role: symbol_short!("AGENT"),
        spender: spender.clone(),
        daily_limit_stroops: 1_000_0000000,
        spent_today_stroops: 0,
        max_single_tx_stroops: None,
        cost_center: None,
        period_reset_ts: t0,
        allowed_merchants: merchants,
        is_active: true,
    };
    client.upsert_policy(&admin, &policy);

    // Spend entire daily limit
    let spent1 = client.authorize_spend(
        &symbol_short!("ROLL_24H"),
        &spender,
        &merchant,
        &primary_token,
        &1_000_0000000,
        &1_000_0000000,
    );
    assert_eq!(spent1, 1_000_0000000);

    // Same day spend fails
    let err = client.try_authorize_spend(
        &symbol_short!("ROLL_24H"),
        &spender,
        &merchant,
        &primary_token,
        &100_0000000,
        &100_0000000,
    );
    assert_eq!(err, Err(Ok(VaultError::DailyLimitExceeded)));

    // Advance ledger timestamp by exactly 86,400 seconds (24h)
    env.ledger().set_timestamp(t0 + 86_400);

    // Spend succeeds again and resets spent_today_stroops
    let spent2 = client.authorize_spend(
        &symbol_short!("ROLL_24H"),
        &spender,
        &merchant,
        &primary_token,
        &250_0000000,
        &250_0000000,
    );
    assert_eq!(spent2, 250_0000000);

    let policy_after = client.get_policy(&symbol_short!("ROLL_24H")).unwrap();
    assert_eq!(policy_after.spent_today_stroops, 250_0000000);
    assert_eq!(policy_after.period_reset_ts, t0 + 86_400);
}
