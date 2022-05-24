import React from "react"
import styled from "styled-components"
import { Button } from "./buttons"

const Container = styled.div.attrs(() => ({ className: "container" }))`
  margin-top: 1rem;
`

const WelcomeText = styled.div`
  font-size: 16px;  
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`

const Buttons = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  text-align: center;
`

const TextLink = styled.a`
  color: inherit;  
  font-size: 14px; 

  :hover {
    cursor: pointer;
    color: white;
  }
`


const Jumbotron = () => {
  return (
    <Container>
      <WelcomeText>
        Welcome to Beta version of Tamago multi-chain NFT marketplace allows anyone to list the NFT once and sell everywhere, supports ERC-721/ERC-1155/ERC-20 tokens
      </WelcomeText>
      <Buttons>
        <Button style={{marginBottom: "10px", }}>
          Create Order
        </Button>
        <br/>
        <TextLink href="https://github.com/tamago-finance/marketplace-scb10x" target="_blank">
          GitHub
        </TextLink>
        <TextLink href="https://docs.tamago.finance/tamago-finance/multi-chain-marketplace" target="_blank" style={{marginLeft: "10px"}}>
          Docs
        </TextLink>
         
        {/* <Button className="btn-secondary">
          Github
        </Button>
        <Button className="btn-secondary">
          Docs
        </Button> */}
      </Buttons>
    </Container>
  )
}


export default Jumbotron
