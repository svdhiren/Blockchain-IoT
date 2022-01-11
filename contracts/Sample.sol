// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Sample {
    uint public number;
    string public str = "Hello";
    event test(string _str);
    function update() public {
        number ++;
    }

    function update_string(string memory _str) public {
        str = _str;
        if(keccak256(abi.encodePacked(str)) == keccak256(abi.encodePacked("yo")))
            revert("Yayy, error ocurred");
        emit test(str);
    }
}