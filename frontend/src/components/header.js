import styled from "styled-components";
import { useState, useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import { Link } from "react-router-dom";
import { Badge } from "reactstrap";

import {
  shortAddress,
  resolveNetworkName,
  resolveNetworkIconUrl,
<<<<<<< HEAD
} from "../helper";
import WalletsModal from "./Modal/WalletConnectModal";
import SwitchChainModal from "./Modal/SwitchChainModal";
=======
} from "../helper"
// import WalletsModal from "./Modal/WalletConnectModal"
import SwitchChainModal from "./Modal/SwitchChainModal"
>>>>>>> 2edf9c36b733b9f819fe8f1f84f749de7e268c95

const NetworkBadge = styled(({ className, toggleSwitchChain, chainId }) => {
  return (
    <div className={className}>
      <a
        className={`btn btn-custom text-primary shadow mr-2`}
        onClick={toggleSwitchChain}
      >
        <div className="image-container">
          <img
            style={{ height: "100%" }}
            src={resolveNetworkIconUrl(chainId)}
          />
        </div>
        <span style={{ color: "#7A0BC0" }} className="ml-4">
          {resolveNetworkName(chainId)}
        </span>
      </a>
    </div>
  );
})`
  position: relative;

  a {
    display: flex;
    align-items: center;
    border-radius: 32px;
  }

  .image-container {
    height: 30px;
    width: 30px;
    margin: auto;
    border-radius: 50%;
    overflow: hidden;
    transform: translateX(-20%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  > .btn-custom {
    background-color: #fff;
  }

  @media only screen and (max-width: 600px) {
    display: none;
  }
`;

const Navbar = styled.div.attrs(() => ({
  className: "container",
}))`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
`;

const StyledBadge = styled(Badge)`
  @media only screen and (max-width: 600px) {
    display: none;
  }
`;

const ConnectWalletButton = styled(Link).attrs(() => ({ className: "btn btn-primary shadow", to: "/account" }))`
  z-index: 10;
  color: white;
  background-image: linear-gradient(to right, #f55f8d 0, #f8ae56 51%, #f55f8d 100%);
  border-radius: 32px;
  padding: 12px;

`

function Header() {
<<<<<<< HEAD
  const { account, chainId, library } = useWeb3React();

  const [walletLoginVisible, setWalletLoginVisible] = useState(false);
  const [switchChainVisible, setSwitchChainVisible] = useState(false);

  const toggleWalletConnect = () => setWalletLoginVisible(!walletLoginVisible);
  const toggleSwitchChain = () => setSwitchChainVisible(!switchChainVisible);
=======


  const { account, chainId, library } = useWeb3React()

  // const [walletLoginVisible, setWalletLoginVisible] = useState(false)
  const [switchChainVisible, setSwitchChainVisible] = useState(false)

  // const toggleWalletConnect = () => setWalletLoginVisible(!walletLoginVisible)
  const toggleSwitchChain = () => setSwitchChainVisible(!switchChainVisible)
>>>>>>> 2edf9c36b733b9f819fe8f1f84f749de7e268c95

  return (
    <>
      {/* <WalletsModal
        toggleWalletConnect={toggleWalletConnect}
        walletLoginVisible={walletLoginVisible}
      /> */}
      <SwitchChainModal
        toggleModal={toggleSwitchChain}
        modalVisible={switchChainVisible}
      />
      <header className="site-header mo-left header-transparent">
        {/* <!-- Main Header --> */}
        <div className="sticky-header main-bar-wraper navbar-expand-lg">
          <div className="d-flex">
            <Navbar>
              {/* <!-- Website Logo --> */}
              <div
                className="logo-header mostion logo-dark"
                style={{
                  width: "225px",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Link to="/">
                  <img
                    src="/images/logo.svg"
                    alt="logo"
                    width="225px"
                    height="45px"
                  />
                </Link>
                <div style={{ marginLeft: "10px", display: "flex" }}>
<<<<<<< HEAD
                  <StyledBadge
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                    color="warning"
                  >
=======
                  <StyledBadge style={{ marginTop: "auto", marginBottom: "auto" }} color="warning">
>>>>>>> 2edf9c36b733b9f819fe8f1f84f749de7e268c95
                    Testnet
                  </StyledBadge>
                </div>
              </div>

              {/* <!-- Extra Nav --> */}
              <div
                className="extra-nav"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {
                  <>
                    {!account ? (
<<<<<<< HEAD
                      <a
                        className="btn btn-primary shadow"
                        style={{
                          zIndex: 10,
                          color: "white",
                          backgroundColor: "#FA58B6",
                          borderColor: "transparent",
                          borderRadius: "32px",
                          padding: 12,
                        }}
                        onClick={toggleWalletConnect}
                      >
=======
                      <ConnectWalletButton  >
>>>>>>> 2edf9c36b733b9f819fe8f1f84f749de7e268c95
                        Connect Wallet
                      </ConnectWalletButton>
                    ) : (
                      <>
                        <NetworkBadge
                          chainId={chainId}
                          toggleSwitchChain={toggleSwitchChain}
                        />
<<<<<<< HEAD
                        <a
                          style={{
                            color: "white",
                            backgroundColor: "#7A0BC0",
                            borderColor: "transparent",
                            borderRadius: "32px",
                            padding: 12,
                          }}
                          className="btn btn-primary shadow mx-4"
                        >
                          {shortAddress(account)}
                        </a>
=======
                        <Link to="/account">
                          <a
                            style={{ color: "white", backgroundImage: "linear-gradient(to right, #f55f8d 0, #f8ae56 51%, #f55f8d 100%)", borderRadius: "32px", padding: 12 }}
                            className="btn btn-primary shadow mx-4"
                          >
                            {shortAddress(account)}
                          </a>
                        </Link>
>>>>>>> 2edf9c36b733b9f819fe8f1f84f749de7e268c95
                      </>
                    )}
                  </>
                }
              </div>
            </Navbar>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
