// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IClientAgentVault} from "./interfaces/IClientAgentVault.sol";

/// @title ClientAgentVault
/// @notice This contract is used to store the funds of the client agent
contract ClientAgentVault is IClientAgentVault, OwnableUpgradeable {
    using SafeERC20 for IERC20;

    string public constant version = "0.1.0";

    ClientAgentVaultStorage private _clientAgentVaultStorage;

    // keccak256(abi.encode(uint256(keccak256("kiteai.storage.ClientAgentVault")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant _clientAgentVaultStorageLocation =
        0x707a354d3f95e606fb6c8a819f4855cfdd0aa513a3801a30b5c65eaeddbe6200;

    /// @dev the max number of spending rules to ensure reasonable gas consumption when checking rules
    /// prevent the vault from being unusable due to out-of-gas errors
    uint256 private constant _maxSpendingRuleLength = 20;

    /// @dev the max number of providers to ensure reasonable gas consumption when checking rules
    /// prevent the vault from being unusable due to out-of-gas errors
    uint256 private constant _maxProviderLength = 10;

    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    address private immutable _settlement;

    modifier onlySettlement() {
        if (msg.sender != _settlement) revert OnlySettlement();
        _;
    }

    constructor(address settlement) {
        _settlement = settlement;
    }

    function _getClientAgentVaultStorage()
        private
        pure
        returns (ClientAgentVaultStorage storage $)
    {
        assembly {
            $.slot := _clientAgentVaultStorageLocation
        }
    }

    function initialize(
        address allowedToken,
        address owner
    ) external initializer {
        __Ownable_init(owner);
        _setAllowedToken(allowedToken);
    }

    /// @dev withdraw the funds from the vault
    /// @param token the token to withdraw
    /// @param amount the amount to withdraw
    function withdrawFunds(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) revert InvalidToken();
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        if (amount > balance) revert InsufficientBalance();

        tokenContract.safeTransfer(msg.sender, amount);
        emit FundsWithdrawn(token, amount, msg.sender);
    }

    /// @dev configure the spending rules
    /// @param indicesToRemove the indices of the spending rules to remove
    /// @param rulesToAdd the spending rules to add
    function configureSpendingRule(
        uint256[] calldata indicesToRemove,
        Rule[] calldata rulesToAdd
    ) external onlyOwner {
        // check the final length is valid
        uint256 finalLength = _getSpendingRuleLength() -
            indicesToRemove.length +
            rulesToAdd.length;
        if (finalLength > _maxSpendingRuleLength) {
            revert MaxSpendingRuleLengthExceeded();
        }

        // sort indices in descending order to avoid index invalidation
        uint256[] memory sortedIndices = _sortIndicesDescending(
            indicesToRemove
        );

        for (uint256 i = 0; i < sortedIndices.length; i++) {
            _removeSpendingRule(sortedIndices[i]);
        }
        for (uint256 i = 0; i < rulesToAdd.length; i++) {
            _addSpendingRule(rulesToAdd[i]);
        }
    }

    /// @dev set spending rules (replace all existing rules)
    /// @param rules the spending rules to set
    function setSpendingRules(Rule[] calldata rules) external onlyOwner {
        _clearSpendingRules();
        for (uint256 i = 0; i < rules.length; i++) {
            _addSpendingRule(rules[i]);
        }
    }

    function addSpendingRules(Rule[] calldata rules) external onlyOwner {
        for (uint256 i = 0; i < rules.length; i++) {
            _addSpendingRule(rules[i]);
        }
    }

    function removeSpendingRules(
        uint256[] calldata indices
    ) external onlyOwner {
        for (uint256 i = 0; i < indices.length; i++) {
            _removeSpendingRule(indices[i]);
        }
    }

    /// @dev debit the funds from the vault
    /// @param amount the amount to debit
    /// @param serviceProvider the service provider
    /// @param to the address to debit the funds to
    function debit(
        uint256 amount,
        bytes32 serviceId,
        bytes32 serviceProvider,
        address to
    ) external onlySettlement {
        IERC20 tokenContract = IERC20(
            _getClientAgentVaultStorage().allowedToken
        );
        uint256 balance = tokenContract.balanceOf(address(this));
        if (amount > balance) revert InsufficientBalance();
        if (!_checkSpendingRules(amount, serviceProvider))
            revert SpendingRuleNotPassed();
        tokenContract.safeTransfer(to, amount);
        emit Debit(
            address(tokenContract),
            amount,
            serviceId,
            serviceProvider,
            to
        );
    }

    /// @dev get the spending rules
    /// @return the spending rules
    function getSpendingRules() external view returns (SpendingRule[] memory) {
        SpendingRule[] memory spendingRules = _getClientAgentVaultStorage()
            .spendingRules;
        for (uint256 i = 0; i < spendingRules.length; i++) {
            spendingRules[i].usage.amountUsed = _getUsage(i);
        }
        return spendingRules;
    }

    /// @dev get the usage of the spending rule
    /// @param index the index of the spending rule
    /// @return the usage of the spending rule
    function getUsage(uint256 index) external view returns (uint256) {
        return _getUsage(index);
    }

    /// @dev get the available balance of the vault
    function getAvailableBalance() external view returns (uint256) {
        return
            IERC20(_getClientAgentVaultStorage().allowedToken).balanceOf(
                address(this)
            );
    }

    function settlementToken() external view returns (address) {
        return _getClientAgentVaultStorage().allowedToken;
    }

    function checkSpendingRules(
        uint256 amount,
        bytes32 serviceProvider
    ) external view returns (bool) {
        return _checkSpendingRulesView(amount, serviceProvider);
    }

    /// @dev check spending rules without modifying state (view only)
    function _checkSpendingRulesView(
        uint256 amount,
        bytes32 serviceProvider
    ) internal view returns (bool) {
        ClientAgentVaultStorage storage $ = _getClientAgentVaultStorage();
        for (uint256 i = 0; i < $.spendingRules.length; i++) {
            if (
                !_checkSpendingRule(amount, serviceProvider, $.spendingRules[i])
            ) {
                return false;
            }
        }
        return true;
    }

    function _addSpendingRule(Rule calldata rule) internal {
        ClientAgentVaultStorage storage $ = _getClientAgentVaultStorage();
        // don't support future spending rules
        if (rule.initialWindowStartTime > block.timestamp) {
            revert InvalidWindowStartTime();
        }
        // align the last updated time with the time window
        // if the time window is 0, then the last updated time will never be used, so we can let it to 0
        uint128 currentTimeWindowStartTime = rule.timeWindow > 0
            ? rule.initialWindowStartTime
            : 0;
        if (rule.targetProviders.length > _maxProviderLength) {
            revert MaxProviderLengthExceeded();
        }
        $.spendingRules.push(
            SpendingRule({
                rule: rule,
                usage: Usage({
                    currentTimeWindowStartTime: currentTimeWindowStartTime,
                    amountUsed: 0
                })
            })
        );

        emit SpendingRuleAdded(
            rule.timeWindow,
            rule.budget,
            rule.initialWindowStartTime,
            rule.targetProviders
        );
    }

    function _removeSpendingRule(uint256 index) internal {
        ClientAgentVaultStorage storage $ = _getClientAgentVaultStorage();
        if (index >= $.spendingRules.length) revert InvalidIndex();

        SpendingRule memory removedRule = $.spendingRules[index];
        $.spendingRules[index] = $.spendingRules[$.spendingRules.length - 1];
        $.spendingRules.pop();
        emit SpendingRuleRemoved(
            removedRule.rule.timeWindow,
            removedRule.rule.budget,
            removedRule.rule.initialWindowStartTime,
            removedRule.rule.targetProviders
        );
    }

    /// @dev clear all the spending rules
    function _clearSpendingRules() internal {
        ClientAgentVaultStorage storage $ = _getClientAgentVaultStorage();
        delete $.spendingRules;
        emit SpendingRulesCleared();
    }

    function _getSpendingRuleLength() internal view returns (uint256) {
        return _getClientAgentVaultStorage().spendingRules.length;
    }

    function _getUsage(uint256 index) internal view returns (uint128) {
        ClientAgentVaultStorage storage $ = _getClientAgentVaultStorage();
        if (index >= $.spendingRules.length) revert InvalidIndex();
        // reset the usage if the window has passed
        if (
            $.spendingRules[index].usage.currentTimeWindowStartTime +
                $.spendingRules[index].rule.timeWindow <
            block.timestamp
        ) {
            return 0;
        }
        return $.spendingRules[index].usage.amountUsed;
    }

    function _checkSpendingRules(
        uint256 amount,
        bytes32 serviceProvider
    ) internal returns (bool) {
        ClientAgentVaultStorage storage $ = _getClientAgentVaultStorage();
        for (uint256 i = 0; i < $.spendingRules.length; i++) {
            if (
                !_checkSpendingRule(amount, serviceProvider, $.spendingRules[i])
            ) {
                return false;
            }
        }
        
        for (uint256 i = 0; i < $.spendingRules.length; i++) {
            _updateSpendingRule(amount, serviceProvider, $.spendingRules[i]);
        }
        
        return true;
    }

    /// @dev check if the spending rule is applicable to the service provider
    function _isApplicable(
        SpendingRule storage spendingRule,
        bytes32 serviceProvider
    ) internal view returns (bool) {
        if (spendingRule.rule.targetProviders.length == 0) return true;
        for (uint256 i = 0; i < spendingRule.rule.targetProviders.length; i++) {
            if (spendingRule.rule.targetProviders[i] == serviceProvider)
                return true;
        }
        return false;
    }

    /// @dev check if the usage allows the specified amount (view function)
    /// @param spendingRule the spending rule to check
    /// @param amount the amount to check
    /// @return true if the amount can be used according to the rule
    function _checkUsage(
        SpendingRule storage spendingRule,
        uint256 amount
    ) internal view returns (bool) {
        // if the time window is 0, then the budget applies to each transaction
        if (spendingRule.rule.timeWindow == 0) {
            return spendingRule.rule.budget >= amount;
        }
        
        // calculate current usage considering potential window reset
        uint128 currentUsage = spendingRule.usage.amountUsed;
        
        // check if the window has passed
        if (
            block.timestamp - spendingRule.usage.currentTimeWindowStartTime >
            spendingRule.rule.timeWindow
        ) {
            currentUsage = 0; // would be reset
        }
        
        return currentUsage + amount <= spendingRule.rule.budget;
    }

    /// @dev update the usage for the spending rule
    /// @param spendingRule the spending rule to update
    /// @param amount the amount to add to usage
    function _updateUsage(
        SpendingRule storage spendingRule,
        uint256 amount
    ) internal {
        // if the time window is 0, no need to update usage
        if (spendingRule.rule.timeWindow == 0) {
            return;
        }
        
        // reset the usage if the window has passed
        // block.timestamp is always greater than or equal to spendingRule.usage.currentTimeWindowStartTime
        if (
            block.timestamp - spendingRule.usage.currentTimeWindowStartTime >
            spendingRule.rule.timeWindow
        ) {
            spendingRule.usage.amountUsed = 0;
            uint128 windowPassed = uint128(
                block.timestamp - spendingRule.usage.currentTimeWindowStartTime
            ) / uint128(spendingRule.rule.timeWindow);
            spendingRule.usage.currentTimeWindowStartTime +=
                windowPassed *
                uint128(spendingRule.rule.timeWindow);
        }
        
        spendingRule.usage.amountUsed += uint128(amount);
        emit UsageUpdated(
            spendingRule.usage.amountUsed,
            spendingRule.usage.currentTimeWindowStartTime,
            amount
        );
    }

    /// @dev check if the spending rule is applicable to the service provider
    /// @return true if passed the spending rule
    function _checkSpendingRule(
        uint256 amount,
        bytes32 serviceProvider,
        SpendingRule storage spendingRule
    ) internal view returns (bool) {
        if (!_isApplicable(spendingRule, serviceProvider)) return true;
        return _checkUsage(spendingRule, amount);
    }

    /// @dev update the spending rule usage if applicable
    function _updateSpendingRule(
        uint256 amount,
        bytes32 serviceProvider,
        SpendingRule storage spendingRule
    ) internal {
        if (_isApplicable(spendingRule, serviceProvider)) {
            _updateUsage(spendingRule, amount);
        }
    }

    function _setAllowedToken(address token) internal {
        _getClientAgentVaultStorage().allowedToken = token;
    }

    function _sortIndicesDescending(
        uint256[] calldata indices
    ) internal pure returns (uint256[] memory) {
        if (indices.length == 0) {
            return new uint256[](0);
        }

        for (uint256 i = 0; i < indices.length; i++) {
            for (uint256 j = i + 1; j < indices.length; j++) {
                if (indices[i] == indices[j]) {
                    revert InvalidIndex();
                }
            }
        }

        uint256[] memory sortedIndices = new uint256[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            sortedIndices[i] = indices[i];
        }

        for (uint256 i = 0; i < sortedIndices.length; i++) {
            for (uint256 j = 0; j < sortedIndices.length - 1 - i; j++) {
                if (sortedIndices[j] < sortedIndices[j + 1]) {
                    uint256 temp = sortedIndices[j];
                    sortedIndices[j] = sortedIndices[j + 1];
                    sortedIndices[j + 1] = temp;
                }
            }
        }

        return sortedIndices;
    }
}
