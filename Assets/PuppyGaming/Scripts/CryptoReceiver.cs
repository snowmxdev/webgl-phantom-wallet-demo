using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class CryptoReceiver : MonoBehaviour
{
    public static CryptoReceiver CR;
    public List<string> myTokens;
    public List<CryptoNFT> myNFTs;
    [DllImport("__Internal")]
    private static extern string SolanaLogin();

    // When the script first loads, it makes sure this is the only running one and destroys any other.
    // It also persists across scenes
    void Awake()
    {
        if (CR != null)
        {
            GameObject.Destroy(CR);
        }
        else
        {
            CR = this;
        }
        DontDestroyOnLoad(this);
    }

    // This function receives the string sent from the JavaScript function on the WebGL's
    // page and add each string (NFT Mint ID) into a list
    // This list can be accessed anywhere with CryptoReceiver.CR.myTokens
    public void ReceiveToken(string mint)
    {
        if (!myTokens.Contains(mint))
        {
            int addLocation = 0;
            while (addLocation < myTokens.Count)
            {
                addLocation++;
            }
            myTokens.Add(mint);
            Debug.Log("Added: " + mint);
        }
    }

    // This function receives the string sent from the JavaScript function on the WebGL's
    // page and and parses the string into sections divided by the "|" character as the function only allows 1 string
    // It then populates a list with CryptoNFT objects which contain common NFT data
    public void ReceiveNFT(string data)
    {
        // Split up the NFT metadata
        string[] nftdata = data.Split('|');
        string dataname = (nftdata[0]);
        string datasprite = (nftdata[1]);
        string datacontent = (nftdata[2]);
        // Instantiate a new CryptoNFT object
        CryptoNFT newNFT = CryptoNFT.CreateInstance<CryptoNFT>();
        newNFT.nftName = dataname;
        newNFT.spritelink = datasprite;
        newNFT.description = datacontent;
        // Add the instantiated CryptoNFT to the myNFTs List
        int addLocation = 0;
        while (addLocation < myNFTs.Count)
        {
            addLocation++;
        }
        myNFTs.Add(newNFT);
    }
    public void OnConnect(){
            SolanaLogin();
    }

    public void ClearOnLogout()
    {
        myNFTs.Clear();
        myTokens.Clear();
    }

}