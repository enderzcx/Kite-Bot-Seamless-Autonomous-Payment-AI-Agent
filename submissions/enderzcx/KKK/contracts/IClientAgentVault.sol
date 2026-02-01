// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IClientAgentVault {
    struct SpendingRule {
        Rule rule;
        Usage usage;
    }

    struct Rule {
        // slot 0
        uint256 timeWindow; // 0 for each transaction, otherwise the time window in seconds
        // slot 1
        uint160 budget; // the budget for the time window, in token decimals
        uint96 initialWindowStartTime; // the start time of the time window, if 0, then the time window is for each transaction
        // slot 2
        bytes32[] targetProviders; // the target providers, if empty, apply to all providers, otherwise only apply to the providers in the array
    }

    struct Usage {
        uint128 amountUsed; // the amount used in the time window, in token decimals
        uint128 currentTimeWindowStartTime; // must be aligned with the time window
    }

    struct ClientAgentVaultStorage {
        SpendingRule[] spendingRules;
        address allowedToken;
    }

    event FundsWithdrawn(address token, uint256 amount, address to);
    event SpendingRuleAdded(
        uint256 timeWindow,
        uint160 budget,
        uint96 initialWindowStartTime,
        bytes32[] targetProviders
    );
    event SpendingRuleRemoved(
        uint256 timeWindow,
        uint160 budget,
        uint96 initialWindowStartTime,
        bytes32[] targetProviders
    );
    event UsageUpdated(
        uint256 amountUsed,
        uint256 currentTimeWindowStartTime,
        uint256 chargedAmount
    );
    event Debit(
        address token,
        uint256 amount,
        bytes32 serviceId,
        bytes32 serviceProvider,
        address to
    );

    event SpendingRulesCleared();

    error InvalidIndex();
    error InvalidToken();
    error InsufficientBalance();
    error SpendingRuleNotPassed();
    error MaxSpendingRuleLengthExceeded();
    error MaxProviderLengthExceeded();
    error InvalidWindowStartTime();
    error OnlySettlement();

    function withdrawFunds(address token, uint256 amount) external;

    function configureSpendingRule(
        uint256[] calldata indicesToRemove,
        Rule[] calldata rulesToAdd
    ) external;

    function debit(
        uint256 amount,
        bytes32 serviceId,
        bytes32 serviceProvider,
        address to
    ) external;

    function getSpendingRules() external view returns (SpendingRule[] memory);

    function settlementToken() external view returns (address);

    function getAvailableBalance() external view returns (uint256);

    function checkSpendingRules(uint256 amount, bytes32 serviceProvider) external view returns (bool);
}
