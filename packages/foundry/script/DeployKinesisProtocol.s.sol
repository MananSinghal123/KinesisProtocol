// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {KinesisProtocol} from "../contracts/KinesisProtocol.sol";
import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployKinesisProtocol is Script {
    function run() external {
        vm.startBroadcast();

        string memory network = vm.envString("NETWORK");
        KinesisProtocol kinesisProtocol;

        if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("arbitrum"))) {
            kinesisProtocol = new KinesisProtocol(
                IERC20(vm.envAddress("ARB_ASSET_ADDRESS")),
                vm.envAddress("ARB_OWNER_ADDRESS"),
                vm.envAddress("ARB_CCIP_ROUTER_ADDRESS"),
                vm.envAddress("ARB_LINK_ADDRESS"),
                vm.envAddress("ARB_AAVE_ADDRESS_PROVIDER")
            );
        } else if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("optimism"))) {
            kinesisProtocol = new KinesisProtocol(
                IERC20(vm.envAddress("OPT_ASSET_ADDRESS")),
                vm.envAddress("OPT_OWNER_ADDRESS"),
                vm.envAddress("OPT_CCIP_ROUTER_ADDRESS"),
                vm.envAddress("OPT_LINK_ADDRESS"),
                vm.envAddress("OPT_AAVE_ADDRESS_PROVIDER")
            );
        } else {
            revert("Unsupported network");
        }

        vm.stopBroadcast();

        console.log("KinesisProtocol deployed at:", address(kinesisProtocol));
    }
}