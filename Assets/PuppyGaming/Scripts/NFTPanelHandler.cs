using UnityEngine;
using UnityEngine.UI;
using System.Collections;
public class NFTPanelHandler : MonoBehaviour
{
    public NFTPrefab nftPrefab;
    public Transform content;
    public GameObject loadingText;

    public void RefreshNFTList()
    {
        // Display loading panel while istantiating NFTs
        loadingText.SetActive(true);
        // Clear items to refresh to stop duplicates:
        foreach (Transform t in content)
        {
            Destroy(t.gameObject);
        }
        StartCoroutine(RefreshNFT());
    }
    IEnumerator RefreshNFT()
    {
        // For each NFT in the myNFTs list we create a new card to display our NFT
        var ownedNFT = CryptoReceiver.CR.myNFTs;
        for (int i = 0; i < ownedNFT.Count; i++){
            yield return new WaitForSeconds(0.3f);
            NFTPrefab item = Instantiate(nftPrefab);
            item.transform.SetParent(content.transform, false);
            item.nftName.text = ownedNFT[i].nftName;
            item.nftImageString = ownedNFT[i].spritelink;
            item.nftDescription.text = ownedNFT[i].description;

            // This will remove the laoding panel once the last NFT has been instantiated
            if (content.childCount == ownedNFT.Count) loadingText.SetActive(false);
        }
        
    }
}
