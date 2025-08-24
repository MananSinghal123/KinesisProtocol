// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {KinesisProtocol} from "../contracts/KinesisProtocol.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolAddressesProvider} from "../contracts/interfaces/aave/IPoolAddressesProvider.sol";
import {IPool} from "../contracts/interfaces/aave/IPool.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

contract KinesisProtocolTest is Test {
    KinesisProtocol public kinesisProtocol;
    ERC20Mock public mockAsset;
    address public owner;
    address public user;
    address public mockCcipRouter;
    address public mockLink;
    address public mockAddressProvider;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        mockAsset = new ERC20Mock();
        mockCcipRouter = address(0x2);
        mockLink = address(0x3);
        mockAddressProvider = address(0x4);

        kinesisProtocol = new KinesisProtocol(
            IERC20(address(mockAsset)),
            owner,
            mockCcipRouter,
            mockLink,
            mockAddressProvider
        );

        vm.label(address(kinesisProtocol), "KinesisProtocol");
        vm.label(address(mockAsset), "MockAsset");
        vm.label(owner, "Owner");
        vm.label(user, "User");
    }

    function testUserDeposit() public {
        uint256 depositAmount = 1000;
        mockAsset.mint(user, depositAmount);

        vm.startPrank(user);
        mockAsset.approve(address(kinesisProtocol), depositAmount);
        uint256 shares = kinesisProtocol.userDeposit(depositAmount);
        vm.stopPrank();

        assertEq(kinesisProtocol.balanceOf(user), shares);
        assertEq(mockAsset.balanceOf(address(kinesisProtocol)), depositAmount);
    }

    // function testUserDepositZeroAmount() public {
    //     vm.expectRevert(KinesisProtocol.HyperHarvest__AmountCantBeZero.selector);
    //     kinesisProtocol.userDeposit(0);
    // }

    function testUserWithdraw() public {
        uint256 depositAmount = 1000;
        mockAsset.mint(user, depositAmount);

        vm.startPrank(user);
        mockAsset.approve(address(kinesisProtocol), depositAmount);
        uint256 shares = kinesisProtocol.userDeposit(depositAmount);

        uint256 withdrawnAssets = kinesisProtocol.userWithdraw(shares);
        vm.stopPrank();

        assertEq(withdrawnAssets, depositAmount);
        assertEq(kinesisProtocol.balanceOf(user), 0);
        assertEq(mockAsset.balanceOf(user), depositAmount);
    }

    // function testUserWithdrawZeroShares() public {
    //     vm.expectRevert(KinesisProtocol.HyperHarvest__AmountCantBeZero.selector);
    //     kinesisProtocol.userWithdraw(0);
    // }

    // function testUserWithdrawInsufficientShares() public {
    //     vm.prank(user);
    //     vm.expectRevert(KinesisProtocol.HyperHarvest__InsufficientShares.selector);
    //     kinesisProtocol.userWithdraw(1);
    // }

    function testSetOwner() public {
        address newOwner = address(0x5);
        kinesisProtocol.setOwner(newOwner);
        
        vm.prank(newOwner);
        kinesisProtocol.setAllowance(address(0x6));
    }

    // function testSetOwnerZeroAddress() public {
    //     vm.expectRevert(KinesisProtocol.HyperHarvest__AddressCantBeZero.selector);
    //     kinesisProtocol.setOwner(address(0));
    // }

    function testSetCrossChainAssets() public {
        uint256 newAssets = 5000;
        kinesisProtocol.setCrossChainAssets(newAssets);
        assertEq(kinesisProtocol.totalAssets(), newAssets);
    }

    function testSupplyAssetToAave() public {
        uint256 supplyAmount = 1000;
        mockAsset.mint(address(kinesisProtocol), supplyAmount);

        address mockPool = address(0x7);
        vm.mockCall(
            mockAddressProvider,
            abi.encodeWithSelector(IPoolAddressesProvider.getPool.selector),
            abi.encode(mockPool)
        );

        vm.mockCall(
            mockPool,
            abi.encodeWithSelector(IPool.supply.selector),
            abi.encode()
        );

        kinesisProtocol.setAllowance(address(this));
        kinesisProtocol.supplyAssetToAave();

        vm.expectCall(
            mockPool,
            abi.encodeWithSelector(IPool.supply.selector, address(mockAsset), supplyAmount, address(kinesisProtocol), 0)
        );
    }

    function testWithdrawAssetFromAave() public {
        address mockPool = address(0x7);
        address mockAToken = address(0x8);

        vm.mockCall(
            mockAddressProvider,
            abi.encodeWithSelector(IPoolAddressesProvider.getPool.selector),
            abi.encode(mockPool)
        );

        vm.mockCall(
            mockPool,
            abi.encodeWithSelector(IPool.getReserveData.selector),
            abi.encode(mockAToken, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        );

        vm.mockCall(
            mockAToken,
            abi.encodeWithSelector(IERC20.balanceOf.selector),
            abi.encode(1000)
        );

        vm.mockCall(
            mockPool,
            abi.encodeWithSelector(IPool.withdraw.selector),
            abi.encode(1000)
        );

        kinesisProtocol.setAllowance(address(this));
        kinesisProtocol.withdrawAssetFromAave();

        vm.expectCall(
            mockPool,
            abi.encodeWithSelector(IPool.withdraw.selector, address(mockAsset), type(uint256).max, address(kinesisProtocol))
        );
    }

    function testBridgeAndSupplyAssetToAave() public {
        uint256 totalBalance = 1000;
        uint256 gasFeeAmount = 100;
        uint64 destinationChainSelector = 1;
        address receiver = address(0x9);

        mockAsset.mint(address(kinesisProtocol), totalBalance);

        vm.mockCall(
            mockCcipRouter,
            abi.encodeWithSelector(IRouterClient.getFee.selector),
            abi.encode(gasFeeAmount)
        );

        vm.mockCall(
            mockLink,
            abi.encodeWithSelector(IERC20.balanceOf.selector),
            abi.encode(gasFeeAmount)
        );

        vm.mockCall(
            mockCcipRouter,
            abi.encodeWithSelector(IRouterClient.ccipSend.selector),
            abi.encode(bytes32(uint256(1)))
        );

        kinesisProtocol.setAllowance(address(this));
        bytes32 messageId = kinesisProtocol.bridgeAndSupplyAssetToAave(receiver, gasFeeAmount, destinationChainSelector);

        assertEq(messageId, bytes32(uint256(1)));
    }
}