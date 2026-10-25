#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype,
    Address, BytesN, Env, String, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VaultError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    VaultPaused = 3,
    UnauthorizedCfo = 4,
    InvalidPasskeySignature = 5,
    PolicyNotFound = 6,
    PolicyInactive = 7,
    UnauthorizedSpender = 8,
    MerchantNotWhitelisted = 9,
    SingleTxLimitExceeded = 10,
    DailyLimitExceeded = 11,
    InvalidAmount = 12,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendPolicyData {
    pub policy_id: Symbol,
    pub label: String,
    pub role: Symbol, // e.g., symbol_short!("HUMAN") or symbol_short!("AGENT")
    pub spender: Address,
    pub daily_limit_stroops: i128,
    pub spent_today_stroops: i128,
    pub max_single_tx_stroops: Option<i128>, // CAP-0086 sparse optional field
    pub cost_center: Option<String>,         // CAP-0086 sparse optional field
    pub period_reset_ts: u64,
    pub allowed_merchants: Vec<Address>,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultMetadata {
    pub owner: Address,
    pub primary_token: Address,
    pub subsidiary_name: String,
    pub paused: bool,
    pub cfo_passkey_registered: bool,
    pub total_settled_count: u64,
    pub total_usdc_volume_stroops: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    PrimaryToken,
    SubsidiaryName,
    CfoPasskey,
    TotalSettledCount,
    TotalUsdcVolumeStroops,
    Policy(Symbol),
    PolicyIds,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendAuthorized {
    #[topic]
    pub policy_id: Symbol,
    #[topic]
    pub spender: Address,
    pub merchant: Address,
    pub token: Address,
    pub token_amount: i128,
    pub usdc_equiv_amount: i128,
    pub new_spent_today: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PolicyUpserted {
    #[topic]
    pub policy_id: Symbol,
    #[topic]
    pub spender: Address,
    pub daily_limit_stroops: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PolicyLimitUpdated {
    #[topic]
    pub policy_id: Symbol,
    pub new_daily_limit_stroops: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CfoPasskeyRegistered {
    #[topic]
    pub owner: Address,
}

const DAY_IN_LEDGERS: u32 = 17_280;
const INSTANCE_BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const INSTANCE_BUMP_TO: u32 = 60 * DAY_IN_LEDGERS;
const PERSISTENT_BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const PERSISTENT_BUMP_TO: u32 = 60 * DAY_IN_LEDGERS;

fn require_owner(env: &Env, caller: &Address) -> Result<Address, VaultError> {
    caller.require_auth();
    let owner = stellar_access::ownable::get_owner(env).ok_or(VaultError::NotInitialized)?;
    if *caller != owner {
        return Err(VaultError::UnauthorizedCfo);
    }
    Ok(owner)
}

fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_BUMP_THRESHOLD, INSTANCE_BUMP_TO);
}

#[contract]
pub struct TreasuryVaultContract;

#[contractimpl]
impl TreasuryVaultContract {
    pub fn __constructor(env: Env, admin: Address, primary_token: Address, subsidiary_name: String) {
        stellar_access::ownable::set_owner(&env, &admin);
        env.storage().instance().set(&DataKey::PrimaryToken, &primary_token);
        env.storage().instance().set(&DataKey::SubsidiaryName, &subsidiary_name);
        env.storage().instance().set(&DataKey::TotalSettledCount, &0u64);
        env.storage().instance().set(&DataKey::TotalUsdcVolumeStroops, &0i128);
        bump_instance(&env);
    }

    pub fn register_cfo_passkey(env: Env, caller: Address, pubkey: BytesN<65>) -> Result<(), VaultError> {
        let owner = require_owner(&env, &caller)?;
        if pubkey.get(0) != Some(4) {
            return Err(VaultError::InvalidPasskeySignature);
        }
        env.storage().instance().set(&DataKey::CfoPasskey, &pubkey);
        bump_instance(&env);
        CfoPasskeyRegistered { owner }.publish(&env);
        Ok(())
    }

    pub fn verify_cfo_passkey(
        env: Env,
        payload_digest: BytesN<32>,
        signature: BytesN<64>,
    ) -> Result<bool, VaultError> {
        let pubkey: BytesN<65> = env
            .storage()
            .instance()
            .get(&DataKey::CfoPasskey)
            .ok_or(VaultError::InvalidPasskeySignature)?;

        env.crypto_hazmat()
            .secp256r1_verify(&pubkey, &payload_digest, &signature);
        Ok(true)
    }

    pub fn upsert_policy(env: Env, caller: Address, policy: SpendPolicyData) -> Result<(), VaultError> {
        require_owner(&env, &caller)?;
        Self::internal_upsert_policy(&env, policy)
    }

    pub fn upsert_policy_with_passkey(
        env: Env,
        caller: Address,
        policy: SpendPolicyData,
        payload_digest: BytesN<32>,
        signature: BytesN<64>,
    ) -> Result<(), VaultError> {
        require_owner(&env, &caller)?;
        Self::verify_cfo_passkey(env.clone(), payload_digest, signature)?;
        Self::internal_upsert_policy(&env, policy)
    }

    pub fn update_daily_limit(
        env: Env,
        caller: Address,
        policy_id: Symbol,
        new_daily_limit_stroops: i128,
    ) -> Result<SpendPolicyData, VaultError> {
        require_owner(&env, &caller)?;
        if new_daily_limit_stroops <= 0 {
            return Err(VaultError::InvalidAmount);
        }
        let policy_key = DataKey::Policy(policy_id.clone());
        let mut policy: SpendPolicyData = env
            .storage()
            .persistent()
            .get(&policy_key)
            .ok_or(VaultError::PolicyNotFound)?;

        policy.daily_limit_stroops = new_daily_limit_stroops;
        env.storage().persistent().set(&policy_key, &policy);
        env.storage()
            .persistent()
            .extend_ttl(&policy_key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);
        bump_instance(&env);

        PolicyLimitUpdated {
            policy_id: policy_id.clone(),
            new_daily_limit_stroops,
        }
        .publish(&env);

        Ok(policy)
    }

    pub fn authorize_spend(
        env: Env,
        policy_id: Symbol,
        spender: Address,
        merchant: Address,
        token: Address,
        token_amount: i128,
        usdc_equiv_amount: i128,
    ) -> Result<i128, VaultError> {
        if stellar_contract_utils::pausable::paused(&env) {
            return Err(VaultError::VaultPaused);
        }

        spender.require_auth();

        if token_amount <= 0 || usdc_equiv_amount <= 0 {
            return Err(VaultError::InvalidAmount);
        }

        let policy_key = DataKey::Policy(policy_id.clone());
        let mut policy: SpendPolicyData = env
            .storage()
            .persistent()
            .get(&policy_key)
            .ok_or(VaultError::PolicyNotFound)?;

        if !policy.is_active {
            return Err(VaultError::PolicyInactive);
        }

        if policy.spender != spender {
            return Err(VaultError::UnauthorizedSpender);
        }

        if !policy.allowed_merchants.contains(&merchant) {
            return Err(VaultError::MerchantNotWhitelisted);
        }

        // Rolling 24h window
        let now = env.ledger().timestamp();
        if now >= policy.period_reset_ts.saturating_add(86_400) {
            policy.spent_today_stroops = 0;
            policy.period_reset_ts = now;
        }

        // CAP-0086 sparse single-tx limit check
        if let Some(max_tx) = policy.max_single_tx_stroops {
            if usdc_equiv_amount > max_tx {
                return Err(VaultError::SingleTxLimitExceeded);
            }
        }

        // Checked math for daily limit
        let next_spent = policy
            .spent_today_stroops
            .checked_add(usdc_equiv_amount)
            .ok_or(VaultError::DailyLimitExceeded)?;
        if next_spent > policy.daily_limit_stroops {
            return Err(VaultError::DailyLimitExceeded);
        }

        policy.spent_today_stroops = next_spent;
        env.storage().persistent().set(&policy_key, &policy);
        env.storage()
            .persistent()
            .extend_ttl(&policy_key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);

        // Transfer token_amount from current contract to spender
        let contract_addr = env.current_contract_address();
        soroban_sdk::token::Client::new(&env, &token).transfer(
            &contract_addr,
            &spender,
            &token_amount,
        );

        // Update global counters
        let total_settled: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSettledCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSettledCount, &total_settled.saturating_add(1));

        let total_volume: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalUsdcVolumeStroops)
            .unwrap_or(0);
        let next_volume = total_volume.checked_add(usdc_equiv_amount).unwrap_or(i128::MAX);
        env.storage()
            .instance()
            .set(&DataKey::TotalUsdcVolumeStroops, &next_volume);

        bump_instance(&env);

        SpendAuthorized {
            policy_id: policy_id.clone(),
            spender: spender.clone(),
            merchant: merchant.clone(),
            token: token.clone(),
            token_amount,
            usdc_equiv_amount,
            new_spent_today: next_spent,
        }
        .publish(&env);

        Ok(next_spent)
    }

    pub fn set_pause(env: Env, caller: Address, paused: bool) -> Result<(), VaultError> {
        require_owner(&env, &caller)?;
        let is_paused = stellar_contract_utils::pausable::paused(&env);
        if paused && !is_paused {
            stellar_contract_utils::pausable::pause(&env);
        } else if !paused && is_paused {
            stellar_contract_utils::pausable::unpause(&env);
        }
        bump_instance(&env);
        Ok(())
    }

    pub fn get_policy(env: Env, policy_id: Symbol) -> Option<SpendPolicyData> {
        env.storage().persistent().get(&DataKey::Policy(policy_id))
    }

    pub fn list_policies(env: Env) -> Vec<SpendPolicyData> {
        let ids: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::PolicyIds)
            .unwrap_or(Vec::new(&env));
        let mut list = Vec::new(&env);
        for id in ids.iter() {
            if let Some(policy) = env.storage().persistent().get(&DataKey::Policy(id)) {
                list.push_back(policy);
            }
        }
        list
    }

    pub fn get_vault_meta(env: Env) -> VaultMetadata {
        let owner = stellar_access::ownable::get_owner(&env).expect("owner initialized");
        let primary_token = env
            .storage()
            .instance()
            .get(&DataKey::PrimaryToken)
            .expect("primary token initialized");
        let subsidiary_name = env
            .storage()
            .instance()
            .get(&DataKey::SubsidiaryName)
            .expect("subsidiary name initialized");
        let paused = stellar_contract_utils::pausable::paused(&env);
        let cfo_passkey_registered = env.storage().instance().has(&DataKey::CfoPasskey);
        let total_settled_count = env
            .storage()
            .instance()
            .get(&DataKey::TotalSettledCount)
            .unwrap_or(0);
        let total_usdc_volume_stroops = env
            .storage()
            .instance()
            .get(&DataKey::TotalUsdcVolumeStroops)
            .unwrap_or(0);

        VaultMetadata {
            owner,
            primary_token,
            subsidiary_name,
            paused,
            cfo_passkey_registered,
            total_settled_count,
            total_usdc_volume_stroops,
        }
    }
}

impl TreasuryVaultContract {
    fn internal_upsert_policy(env: &Env, mut policy: SpendPolicyData) -> Result<(), VaultError> {
        if policy.daily_limit_stroops <= 0 {
            return Err(VaultError::InvalidAmount);
        }
        if let Some(max_tx) = policy.max_single_tx_stroops {
            if max_tx <= 0 {
                return Err(VaultError::InvalidAmount);
            }
        }
        if policy.period_reset_ts == 0 {
            policy.period_reset_ts = env.ledger().timestamp();
        }

        let policy_key = DataKey::Policy(policy.policy_id.clone());
        env.storage().persistent().set(&policy_key, &policy);
        env.storage()
            .persistent()
            .extend_ttl(&policy_key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);

        let mut ids: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&DataKey::PolicyIds)
            .unwrap_or(Vec::new(env));
        if !ids.contains(&policy.policy_id) {
            ids.push_back(policy.policy_id.clone());
            env.storage().persistent().set(&DataKey::PolicyIds, &ids);
        }
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::PolicyIds, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);
        bump_instance(env);

        PolicyUpserted {
            policy_id: policy.policy_id.clone(),
            spender: policy.spender.clone(),
            daily_limit_stroops: policy.daily_limit_stroops,
        }
        .publish(env);

        Ok(())
    }
}

#[cfg(test)]
mod test;
