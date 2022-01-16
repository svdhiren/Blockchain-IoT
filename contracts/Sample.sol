// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Sample {
    ///Blockchain state variables.
    uint public number;
    string public str = "Hello";
    mapping(address => bool) reg;
    mapping(address => uint) nonces;
    
    event test(string _str);
    event getNonce(uint _nonce);
    

    function update() public {
        number ++;
    }

    function update_string(string memory _str) public {
        str = _str;
        if(keccak256(abi.encodePacked(str)) == keccak256(abi.encodePacked("yo")))
            revert("Yayy, error ocurred");
        emit test(str);
    }

    function without_parameters() public view returns (string memory str1, uint num1) {
            return (str, number);
    }

    function update(uint _n) public returns (uint num1, string memory str1) {
            number += _n;
            return (number, str);
    }    
    
    /// Check whether the message sender has been registered by the admin and send the nonce.
    function register_gateway() public {
        
        // if(reg[msg.sender] != true)
        //     revert("Not registered by the admin...");
        uint non = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number)))%10000;
        nonces[msg.sender] = non;
        emit getNonce(non);
    }



    function verify(
        bytes memory signature
    ) public view returns (bool) {
        uint nonce = nonces[msg.sender];
        bytes32 messageHash = getMessageHash('Message signing', nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == msg.sender;
    }

    function getMessageHash(        
        string memory _message ,
        uint _nonce       
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message, _nonce));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}