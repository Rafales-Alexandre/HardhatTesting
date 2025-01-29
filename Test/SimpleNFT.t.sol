// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, Vm} from "forge-std/Test.sol"; 
import "../Contracts/SimpleNFT.sol";
import {console} from "forge-std/console.sol"; 

contract SimpleNFTTest is Test {
    SimpleNFT private simpleNFT;
    address private owner;
    address private addr1;
    address private addr2;
    event Debug(string message, address addr, uint256 tokenId);
    address private constant ZERO_ADDRESS = address(0);

    function setUp() public {
        owner = address(this);
    addr1 = vm.addr(1);
    addr2 = vm.addr(2);

        simpleNFT = new SimpleNFT("TestNFT", "TNFT");
    }

    function testInitialNameAndSymbol() public {
    assertEq(simpleNFT.name(), "TestNFT");
    assertEq(simpleNFT.symbol(), "TNFT");
}


    function testMintAndOwnership() public {
        simpleNFT.mint(addr1, 1);

        assertEq(simpleNFT.balanceOf(addr1), 1);
        assertEq(simpleNFT.ownerOf(1), addr1);
    }

    function testCannotMintToZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                SimpleNFT.InvalidRecipient.selector,
                ZERO_ADDRESS
            )
        );
        simpleNFT.mint(ZERO_ADDRESS, 1);
    }

    function testCannotMintDuplicateToken() public {
        simpleNFT.mint(addr1, 1);
        vm.expectRevert(
            abi.encodeWithSelector(SimpleNFT.TokenAlreadyExists.selector, 1)
        );
        simpleNFT.mint(addr2, 1);
    }

    function testTransferToken() public {
        simpleNFT.mint(addr1, 1);

        vm.prank(addr1);
        simpleNFT.transferFrom(addr1, addr2, 1);

        assertEq(simpleNFT.ownerOf(1), addr2);
        assertEq(simpleNFT.balanceOf(addr1), 0);
        assertEq(simpleNFT.balanceOf(addr2), 1);
    }

    function testUnauthorizedTransferFails() public {
        simpleNFT.mint(addr1, 1);

        vm.prank(addr2);
        vm.expectRevert(
            abi.encodeWithSelector(SimpleNFT.NotAuthorized.selector, addr2)
        );
        simpleNFT.transferFrom(addr1, addr2, 1);
    }

function testApproveAndGetApproval() public {
    simpleNFT.mint(addr1, 1);
    vm.prank(addr1);
    simpleNFT.approve(addr2, 1);
    
    assertEq(simpleNFT.getApproved(1), addr2);

    vm.prank(addr1);
vm.expectRevert(abi.encodeWithSelector(SimpleNFT.InvalidRecipient.selector, address(0)));
simpleNFT.approve(address(0), 1);

}


function testCannotApproveZeroAddress() public {
    simpleNFT.mint(addr1, 1);

    vm.prank(addr1);
    vm.expectRevert(abi.encodeWithSelector(SimpleNFT.InvalidRecipient.selector, address(0)));
simpleNFT.approve(address(0), 1);
}

    function testSetApprovalForAllAndTransfer() public {
        simpleNFT.mint(addr1, 1);

        vm.prank(addr1);
        simpleNFT.setApprovalForAll(addr2, true);

        assertTrue(simpleNFT.isApprovedForAll(addr1, addr2));

        vm.prank(addr2);
        simpleNFT.transferFrom(addr1, addr2, 1);

        assertEq(simpleNFT.ownerOf(1), addr2);
        assertEq(simpleNFT.balanceOf(addr1), 0);
        assertEq(simpleNFT.balanceOf(addr2), 1);
    }

    function testCannotSelfApproveAsOperator() public {
        vm.prank(addr1);
        vm.expectRevert(
            abi.encodeWithSelector(SimpleNFT.CannotApproveSelf.selector, addr1)
        );
        simpleNFT.setApprovalForAll(addr1, true);
    }
}
