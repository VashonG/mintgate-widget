import React, {useState, useEffect} from "react";
import Masonry from 'react-masonry-css';
import TPPCardEmbed from "./TPPCardEmbed.js"

const TPP = process.env.NEXT_PUBLIC_TPP_SERVER || `https://mgate.io`;

function TPPLinksGrid({tokentid, theme}) {  

  const [tokenData, setTokenData] = useState();

  let _url = new URL(`${TPP}/api/v2/links/token?tokenAddress`);

  fetch('https://mgate.io/api/v2/links/token?tokenAddress=' + tokentid)
    .then(response => response.text())
    .then(data => console.log(data));

    console.log('APIv2:', tokentid);
    console.log('POST url', _url.toString());

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    600: 1,
    500: 1
  };

  return(
      <Masonry
        className="flex h-auto flex-wrap w-auto"
        breakpointCols={breakpointColumnsObj}
      >
        {tokenData && tokenData.links.map(l =>
        <TPPCardEmbed link={l} theme={theme} />
      )}
      </Masonry>
  );
}

export default TPPLinksGrid