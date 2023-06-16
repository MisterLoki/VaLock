import React, { useState, useEffect, Fragment } from "react";
import { Box, Grid, Image, Text, Button, Spinner } from "@chakra-ui/react";

function AgentBox({agents, onSelect, selectedIndex}) {

    const handleAgentClick = (index) => {
    onSelect(index);
  };

  return (
    <Fragment>
      {agents.length == 0 ? (
        <Spinner />
      ) : (
        <Grid templateColumns="repeat(11, 1fr)" gap={10}>
          {agents.map((agent, index) => (
            <Box
              key={index}
              textAlign="center"
              cursor="pointer"
              onClick={() => handleAgentClick(index)}
              border={index === selectedIndex ? "2px solid gold" : "2px solid gray"}
              borderRadius="md"
              height="9vh"
              width="9vh"
              bg={index === selectedIndex ? "gold" : "gray"}
              filter="drop-shadow(0 0 10px rgba(0, 0, 0, 1))"
            >
              <Image src={agent.icon} alt={agent.name} />
            </Box>
          ))}
        </Grid>
      )}
    </Fragment>
  );
}

export default AgentBox;
