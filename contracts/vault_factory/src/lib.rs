#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype,
    panic_with_error, Address, BytesN, Env, String, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum FactoryError {
    NotInitialized = 1,
    Unauthorized = 2,
    ExecutableNotFound = 3,
    SubsidiaryAlreadyExists = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SubsidiaryRecord {
    pub subsidiary_code: Symbol,
    pub name: String,
    pub jurisdiction: String,
    pub vault_address: Address,
    pub executable_tag: Symbol,
    pub wasm_hash: BytesN<32>,
    pub deployed_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    ExecutableRef(Symbol),
    ExecutableTags,
    Subsidiary(Symbol),
    SubsidiaryCodes,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ExecutableRefRegistered {
    #[topic]
    pub tag: Symbol,
    pub wasm_hash: BytesN<32>,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SubsidiaryDeployed {
    #[topic]
    pub subsidiary_code: Symbol,
    pub vault_address: Address,
    pub executable_tag: Symbol,
    pub wasm_hash: BytesN<32>,
}

const DAY_IN_LEDGERS: u32 = 17_280;
const INSTANCE_BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const INSTANCE_BUMP_TO: u32 = 60 * DAY_IN_LEDGERS;
const PERSISTENT_BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const PERSISTENT_BUMP_TO: u32 = 60 * DAY_IN_LEDGERS;

fn require_owner(env: &Env, caller: &Address) -> Address {
    caller.require_auth();
    let Some(owner) = stellar_access::ownable::get_owner(env) else {
        panic_with_error!(env, FactoryError::NotInitialized);
    };
    if *caller != owner {
        panic_with_error!(env, FactoryError::Unauthorized);
    }
    owner
}

fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_BUMP_THRESHOLD, INSTANCE_BUMP_TO);
}

#[contract]
pub struct VaultFactoryContract;

#[contractimpl]
impl VaultFactoryContract {
    pub fn __constructor(
        env: Env,
        admin: Address,
        initial_tag: Symbol,
        initial_wasm_hash: BytesN<32>,
    ) {
        stellar_access::ownable::set_owner(&env, &admin);

        let ref_key = DataKey::ExecutableRef(initial_tag.clone());
        env.storage().persistent().set(&ref_key, &initial_wasm_hash);
        env.storage().persistent().extend_ttl(
            &ref_key,
            PERSISTENT_BUMP_THRESHOLD,
            PERSISTENT_BUMP_TO,
        );

        let mut tags = Vec::new(&env);
        tags.push_back(initial_tag.clone());
        env.storage().persistent().set(&DataKey::ExecutableTags, &tags);
        env.storage().persistent().extend_ttl(
            &DataKey::ExecutableTags,
            PERSISTENT_BUMP_THRESHOLD,
            PERSISTENT_BUMP_TO,
        );

        bump_instance(&env);

        ExecutableRefRegistered {
            tag: initial_tag,
            wasm_hash: initial_wasm_hash,
        }
        .publish(&env);
    }

    pub fn register_executable_ref(
        env: Env,
        caller: Address,
        tag: Symbol,
        wasm_hash: BytesN<32>,
    ) {
        require_owner(&env, &caller);

        let ref_key = DataKey::ExecutableRef(tag.clone());
        env.storage().persistent().set(&ref_key, &wasm_hash);
        env.storage().persistent().extend_ttl(
            &ref_key,
            PERSISTENT_BUMP_THRESHOLD,
            PERSISTENT_BUMP_TO,
        );

        let mut tags: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::ExecutableTags)
            .unwrap_or(Vec::new(&env));
        if !tags.contains(&tag) {
            tags.push_back(tag.clone());
            env.storage().persistent().set(&DataKey::ExecutableTags, &tags);
        }
        env.storage().persistent().extend_ttl(
            &DataKey::ExecutableTags,
            PERSISTENT_BUMP_THRESHOLD,
            PERSISTENT_BUMP_TO,
        );
        bump_instance(&env);

        ExecutableRefRegistered { tag, wasm_hash }.publish(&env);
    }

    pub fn deploy_subsidiary_vault(
        env: Env,
        caller: Address,
        subsidiary_code: Symbol,
        name: String,
        jurisdiction: String,
        executable_tag: Symbol,
        vault_admin: Address,
        primary_token: Address,
        salt: BytesN<32>,
    ) -> Address {
        require_owner(&env, &caller);

        let sub_key = DataKey::Subsidiary(subsidiary_code.clone());
        if env.storage().persistent().has(&sub_key) {
            panic_with_error!(&env, FactoryError::SubsidiaryAlreadyExists);
        }

        let wasm_hash: BytesN<32> = env
            .storage()
            .persistent()
            .get(&DataKey::ExecutableRef(executable_tag.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, FactoryError::ExecutableNotFound));

        #[allow(deprecated)]
        let vault_address = env
            .deployer()
            .with_current_contract(salt)
            .deploy_v2(wasm_hash.clone(), (vault_admin, primary_token, name.clone()));

        let record = SubsidiaryRecord {
            subsidiary_code: subsidiary_code.clone(),
            name,
            jurisdiction,
            vault_address: vault_address.clone(),
            executable_tag: executable_tag.clone(),
            wasm_hash: wasm_hash.clone(),
            deployed_ledger: env.ledger().sequence(),
        };

        env.storage().persistent().set(&sub_key, &record);
        env.storage().persistent().extend_ttl(
            &sub_key,
            PERSISTENT_BUMP_THRESHOLD,
            PERSISTENT_BUMP_TO,
        );

        let mut codes: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::SubsidiaryCodes)
            .unwrap_or(Vec::new(&env));
        if !codes.contains(&subsidiary_code) {
            codes.push_back(subsidiary_code.clone());
            env.storage().persistent().set(&DataKey::SubsidiaryCodes, &codes);
        }
        env.storage().persistent().extend_ttl(
            &DataKey::SubsidiaryCodes,
            PERSISTENT_BUMP_THRESHOLD,
            PERSISTENT_BUMP_TO,
        );
        bump_instance(&env);

        SubsidiaryDeployed {
            subsidiary_code,
            vault_address: vault_address.clone(),
            executable_tag,
            wasm_hash,
        }
        .publish(&env);

        vault_address
    }

    pub fn list_subsidiaries(env: Env) -> Vec<SubsidiaryRecord> {
        let codes: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::SubsidiaryCodes)
            .unwrap_or(Vec::new(&env));
        let mut list = Vec::new(&env);
        for code in codes.iter() {
            if let Some(record) = env.storage().persistent().get(&DataKey::Subsidiary(code)) {
                list.push_back(record);
            }
        }
        list
    }

    pub fn get_executable_ref(env: Env, tag: Symbol) -> Option<BytesN<32>> {
        env.storage().persistent().get(&DataKey::ExecutableRef(tag))
    }
}

#[cfg(test)]
mod test;
