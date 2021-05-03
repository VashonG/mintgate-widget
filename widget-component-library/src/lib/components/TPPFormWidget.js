import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import TPPFormTokenPanel from "./TPPFormTokensPanel";
import { useList } from 'react-use';

const TPP = process.env.NEXT_PUBLIC_TPP_SERVER || 'https://mgate.io'


function isNumeric(n) {
  return !isNaN(parseFloat(n) && isFinite(n));
}

const TOKEN_DEFAULT = {
  userSelectedType: "1",
  amount: "1",
  tokenAddress: "",
  subid: 0,
  network: '1'
}

function TPPFormWidget(props, preselect, onClose) { 
  const[linkTitle, setLinkTitle] = useState('');
  const[formURL, setFormURL] = useState('');
  const [list, { set, push, updateAt, insertAt, update, updateFirst, upsert, sort, filter, removeAt, clear, reset}] = useList([TOKEN_DEFAULT]);
  const router = useRouter();
  const[nftSelected, setnftSelected] = useState(false);
  const[isLoading, setLoading] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const nftSelected = sp.get('tid') || false;
    setnftSelected(nftSelected);
    if (nftSelected) updateAt(0, {...list[0], tokenAddress: nftSelected, userSelectedType: "1", amount: '1'})
  }, []);

  

  const onSubmit = function (e) {
    if (e.preventDefault) e.preventDefault();
    if (isLoading) return;
    
    console.log('list', list)

    const tokenParams = list.map((x, idx) => {
      if((x.tokenAddress.indexOf("0x")) === "-1" && x.userSelectedType !== "1" && x.userSelectedType !=="-1") {
        window.alert(`Please enter a valid token address.`
        );
        return null;
      }

      if(!isNumeric(x.amount)) {
        window.alert("Please enter a valid number of minimum token balance.");
        return null;
      }

      if(!x.tokenAddress || x.tokenAddress === "DEFAULT") {
        alert("Please enter or select a token");
        return;
      }

      return {
        network: x.network || 0,
        subid: x.subid || 0, 
        ttype: x.userSelectedType,
        balance: x.amount || "1",
        token: x.tokenAddress
      }
    });

    if (tokenParams.filter(x => !x).length > 0) return;

    let url = formURL;
    if(url.indexOf('http') === -1) url=`https://${url}`;

    try {
      new URL(url);
      if (url.indexOf('.') === -1) throw new Error('no domain');
    } catch(e) {
      return alert(`Invalid URL ${url}, please check the link address.`);
    }
    
    let _url = new URL(`${TPP}/api/v2/links/create`);

    let jwttoken = props.jwttoken;

    if(!jwttoken) throw new Error('no JWT token. Pass in your JWT token which you can find at https://mintgate,.app/token_api');

    const v2Params = {
      url,
      "title": linkTitle,
      tokens: tokenParams,
      jwt: props.jwttoken
    }

    console.log('APIv2', v2Params);
    console.log('POST url', _url.toString());
    console.log('URL', url);

    fetch(_url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application.json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(v2Params)
    })
    .then((response) => response.json())
    .then((data) => {
      if(data && (data.status === 'fail')) {
        setLoading(false);
        let msg = data.message;
        if (data.details) msg += ': ' + JSON.stringify(data.details, null);
        alert("Form Error: " + msg);
        console.log(e);
        return;
      }

      const link = data.url;

      setTimeout(() => {
        if (preselect) window.location.reload();
        else {
          const qs = new URLSearchParams(window.location.search);
          if (qs.get('tid')) router.push(`/t/${qs.get('tid')}?created=success`)
          else if (qs.get('returnTo')) {
            const returnTo = new URL(decodeURIComponent(qs.get('returnTo')));
            returnTo.searchParams.set('link', link);
            window.location.href = returnTo.toString();
            return;
          }
          else router.push(".index2")
        }
        if (onClose) onClose();
      }, 10);
    })
    .catch((e) => {
      alert("Oh no! We have an error: " + e.toString());
      setLoading(false);
      console.log(e);
    })
  }


  const [nextStepOpen, setNextStepOpen] = useState(false);

  return(
    <div data-theme={props.theme}>  {/* 
      17 Themes are available: 
      - aqua
      - black
      - bumblebee
      - cupcake
      - cyberpunk
      - dark
      - dracula
      - fantasy
      - forest
      - garden
      - halloween
      - light (default)
      - luxury
      - pastel
      - retro
      - synthwave
      - valentine  */}
      <form 
      id="tppform"
      name="tppcreate"
      onSubmit={onSubmit}
      className="h-full w-full card-body bg-base-100">
        <div className="form-control">
        <label className="label">
                <span className={`font-heading font-semibold label-text ${nextStepOpen ? 'hidden' : ''}`}>Enter Link To Gate</span>
              </label> 
          <div className="relative ">
            <input 
            required
            value={formURL}
            onChange={(e) => setFormURL(e.target.value)}
            id="form_url"
            name="contentURL"
            type="text" 
            placeholder="Paste the link you wanna token gate" className={`w-full pr-16 input focus:ring-primary focus:ring-4 label-text text-base font-heading font-semibold ${nextStepOpen ? 'input-gohst' : 'ring-4 ring-primary ring-opacity-20'}`} /> 
            <span onClick={() => {
              setNextStepOpen(true);}} className={`absolute right-0 rounded-l-none btn btn-primary hover:btn-secondary ${nextStepOpen ? 'hidden' : ''}`}>next</span>
          </div>
        </div> 
        <Transition
          show={nextStepOpen}
          enter="transition ease-out duration-500"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-450"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
            {/* Enter Token Title */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="font-heading font-semibold label-text">Title</span>
              </label> 
              <input required type="text"
              onChange={(e) => setLinkTitle(e.target.value)} 
              id="linkTitle"
              name="linkTitle"
              placeholder="Title of your Gated Link" className="font-body font-medium input label-text input-bordered" /> 
            </div>ç
            {list.map((field, idx) => {
            return (
              <div key={idx}>
                {idx > 0 && // Remove Token Button
                  <button onClick={() => removeAt(idx)}
                    className="float-right mb-2 mt-2 rounded-md text-gray-900 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Close panel</span>
                    <span className="text-lg label-text">X</span>
                  </button>
                }

                <TPPFormTokenPanel
                  tokenAddress={field.tokenAddress}
                  setTokenAddress={(x) => updateAt(idx, { ...field, tokenAddress: x })}
                  amount={field.amount}
                  setAmount={(x) => updateAt(idx, { ...field, amount: x })}
                  preselect={preselect}
                  setNetwork={(x) => updateAt(idx, { ...field, network: x })}
                  network={field.network}
                  userSelectedType={field.userSelectedType}
                  setUserSelectedType={(x) => {
                    console.log(idx, 'setUserSelectedType', x);
                    updateAt(idx, {
                      ...field,
                      userSelectedType: x,
                      tokenAddress: x === "-1" ? 'Ether' : ''
                    })
                  }}

                  setSubid={(x) => updateAt(idx, { ...field, subid: x })}
                />

              </div>
            );
          })}
        
          {!nftSelected &&
          <button type="button" className="btn btn-primary hover:btn-secondary" onClick={() => push({ ...TOKEN_DEFAULT})}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Token
          </button> 
          }

          {/* Generate Link and Loading button */}
          <div className="form-control mt-8">
            <button type="submit" 
            className="btn btn-primary hover:btn-secondary">
              Create a Gated Link
            </button>
            {/* Loading Button
            <button className="btn btn-primary loading">loading</button> 
            */}
          </div>
        </Transition>
      </form>
    </div>
  );
}

export default TPPFormWidget