// SPDX-License-Identifier: .
pragma solidity ^0.8.10;

contract Sample {
    ///Blockchain state variables.

    /* 'number' and 'str' are test variables */
    uint public number = 10;
    string public str = "Hello";

    // 'reg' is mapping which stores whether a gateway has registered or not.
    mapping(address => bool) reg;
    // 'nonces' is a mapping which stores nonces for each registered gateway and changes with transaction.
    mapping(address => uint) nonces;
    //This mapping stores whether the dev has been registered or not.
    mapping(string => bool) dev_reg;

    //This structure contains the device information.
    struct Device {
        string pubKey;
        address gate;
        uint nonce;
    }

    //Maps from the device id to device information which is contained in 'Device' struct.
    mapping(string => Device) dev_info;
    mapping(address => string[]) gate_dev;
    
    //Test event to listen to in the script.
    event test(string _str);  

    //Utility function
    function str_cmp(string memory _a, string memory _b) internal pure returns(bool fl){
        return keccak256(abi.encodePacked(_a)) == keccak256(abi.encodePacked(_b));
    }      

    /*The below 3 functions are test functions.*/


    //Multiple value return.
    function without_parameters() public view returns (string memory str1, uint num1) {
            return (str, number);
    }

    //Directly update the number by 'n'.
    function update(uint _n) public {
            number = _n;            
    } 

    //Test transaction to check working with signature.
    function update_string(string memory _str, bytes memory signature) public {
        
        bytes32 messageHash = keccak256(abi.encodePacked(_str, nonces[msg.sender]));
        bool status = verify(signature, messageHash);
        if(status == true)
        {
            if(keccak256(abi.encodePacked(str)) == keccak256(abi.encodePacked("yo")))
            revert("Yayy, error ocurred");
            str = _str;
            nonces[msg.sender] = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number)))%10000;
            emit test("Verification success - String updated");
        }
        else
            emit test("Verification failed - String not updated");

        emit test(str);
    }       
    
    //Function to retrieve nonce.
    function getNonce() public view returns(uint nonce) {
        if(reg[msg.sender] == true)
            return nonces[msg.sender];
        else
            return 0;
    }

    function register_gateway(bytes memory signature) public {
        
        if(reg[msg.sender] == true)
            emit test("Already registered...");
        else{
            bytes32 messageHash = keccak256(abi.encodePacked('Register'));
            bool status = verify(signature, messageHash);
            if(status == true)
            {
                //That means the signature has been verified.
                reg[msg.sender] = true;
                nonces[msg.sender] = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number)))%10000;
            }        
            else
            {
                revert("Registration failed...");
            }
        }
    }

    function register_device(string memory _devId, string memory _pub) public {
        
        if(dev_reg[_devId] == true)
         emit test("Device already registered...");
        else{                        
            //Since the status has been verified, things to do are:
            //1. Mark the device as registered.
            dev_reg[_devId] = true;
            //2. Create a new struct with the information.
            Device memory dev;
            dev.pubKey = _pub;
            dev.gate = msg.sender;
            dev.nonce = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number)))%10000;
            //3. Map the device id to the created struct.
            dev_info[_devId] = dev;

            //4. Also add the device id to the list of devices under the associated gatewyay.  
            gate_dev[msg.sender].push(_devId);                                  
        }
    }

    //Function to check whether device has been registered or not.
    function check_device(string memory _devId) public view returns(bool status){                
        return dev_reg[_devId];
    }

    function get_device_key(string memory _devId) public view returns(string memory){                
        return dev_info[_devId].pubKey;
    }


    //The gateway adds the
    function add_device_nonce(string memory _devId, uint _nonce) public {
        //Check whether the gateway is registered.
        //Also check whether the device is under this gateway.
        if(reg[msg.sender] != true)
        {
            emit test("Gateway not registered...");
            revert("Gateway not registered...");
        }
        
        bool fl = false;
        for(uint i=0;i<gate_dev[msg.sender].length;i++)
        {
            fl = str_cmp(_devId, gate_dev[msg.sender][i]);
            if(fl)
                break;
        }

        if(!fl)
        {
            emit test("Device not associated with this gateway....");
            revert("Device not associated with this gateway...");
        }    
        
        //Add a nonce for the device here.
        dev_info[_devId].nonce = _nonce;   
        emit test("Nonce successfully updated...");
    }

    function get_device_nonce(string memory _devId) public view returns(uint nonce){
        //Check whether the gateway is registered.
        //Also check whether the device is under this gateway.
        if(reg[msg.sender] != true)                   
            return 0;                    
        
        bool fl = false;
        for(uint i=0;i<gate_dev[msg.sender].length;i++)
        {
            fl = str_cmp(_devId, gate_dev[msg.sender][i]);
            if(fl)
                break;
        }

        if(!fl)                    
            return 0;           
        
        //Return nonce for the device here.
        return dev_info[_devId].nonce;               
    }
    




    function verify(
        bytes memory signature,
        bytes32 messageHash        
    ) public view returns (bool) {        
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