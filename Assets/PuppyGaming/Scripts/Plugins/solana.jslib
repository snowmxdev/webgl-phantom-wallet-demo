mergeInto(LibraryManager.library, {
SolanaLogin__deps: ['SolanaTokens'],
Vlawmz__deps: ['SendSolTokens'],
SolanaTokens__deps: ['Vlawmz'],

  // Initial login using Phantom

  SolanaLogin: async function() {
    this.wallet = null;
    this.myKey = null;
    this.myTokens = null;
    this.connection = null;
    if (window.solana.isConnected === false) {
        const resp = await window.solana.connect();
      }
    const pubKey = await window.solana.publicKey;
    this.myKey = pubKey.toString();
    return _SolanaTokens();
  },

  // Grabs meta keys and receives a list of NFT URIs, Credits to Vlawmz for the massive help https://www.titter.com/flawmz

  Vlawmz: async function() {
    let meta_keys = [];
    meta_program = new solanaWeb3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

    for (let i = 0, l = myTokens.length; i < l; i++) {
        let ta = myTokens[i].account.data.parsed.info;
        let mint_key = new solanaWeb3.PublicKey(ta.mint);

        meta_keys.push((await solanaWeb3.PublicKey.findProgramAddress(
            [
                new Uint8Array([109,101,116,97,100,97,116,97]),
                meta_program.toBuffer(),
                mint_key.toBuffer()
            ],
            meta_program
        ))[0].toBase58());
    }
    meta_keys = meta_keys.map((e) => new solanaWeb3.PublicKey(e));
    let metadata_accounts = await connection.getMultipleAccountsInfo(meta_keys.slice(0,100));
    let http = "104116116112115584747";
    let urls = metadata_accounts
  .filter(e => e !== null)
  .map((e) => e.data)
  .map((e) => {
    let arr = Array.from(e);
    let ret = [];
    let push = false;
    for (let i = 0, l = arr.length; i < l; i++) {
      let test = arr.slice(i, i + 8);
      if (test.join('') == http) {
        push = true;
      }

      if (push) {
        if (arr[i] === 0) {
          push = false;
        } else {
          ret.push(arr[i]);
        }
      }
    }
    return ret;
  })
  .map((e) => e.map((e2) => String.fromCharCode(e2)).join(''));
    this.tokenList = urls;
    return _SendSolTokens();
  },

  SolanaTokens: async function() {
    console.log("Your Public Key is ", myKey);
    var url = "https://api.mainnet-beta.solana.com";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = async function () {
      if (xhr.readyState === 4) {
        const tokenResponse = JSON.parse(xhr.responseText);  
        myTokens = await tokenResponse.result.value;

        console.log(myTokens);
        for (var i = 0; i < myTokens.length; i++) {
          if (
            myTokens[i].account.data.parsed.info.tokenAmount.decimals == 0 &&
            myTokens[i].account.data.parsed.info.tokenAmount.amount < 1
          ) {
            myTokens.splice(i, 1);
          }
        }

        return _Vlawmz();
      }
    };
    var data = `
              {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getTokenAccountsByOwner",
                "params": [
                  "${this.myKey}",
                  {
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                  },
                  {
                    "encoding": "jsonParsed"
                  }
                ]
              }
            `;

    xhr.send(data);
  },

  // Finally sends a request to each URI and parses the JSON response then sends each NFT to the CryptoReceiver object

  SendSolTokens: async function() {
    var tokenLength = tokenList.length;
    console.log(tokenLength);
    for (var i = 0; i < tokenLength; i++) {          
      fetch(tokenList[i])
      .then(res => res.json())
      .then(data => {
        console.log(data);
        Module.ccall("SendMessageString", null, ["string", "string", "string"], ["CryptoReceiver", "ReceiveNFT", data.name + "|" + data.image + "|" + data.description]);
      });          
    }
    for (var t = 0; t < myTokens.Length; t++) {
      Module.ccall("SendMessageString", null, ["string", "string", "string"], ["CryptoReceiver", "ReceiveToken", myTokens[t].account.data.parsed.info.mint]);
    }        
  }
})