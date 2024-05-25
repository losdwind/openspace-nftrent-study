// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;
import "forge-std/Script.sol";
import "../src/RenftMarket.sol";

contract RentMarketScript is Script {
    function run() public {
        vm.startBroadcast();
        new RenftMarket();
        vm.stopBroadcast();
    }
}
