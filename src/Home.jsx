import React from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Flex, Box, Stack } from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api/tauri";

const Home = (props) => {
  const navigate = useNavigate();

  const start = () => {
    alert("In this version can not start via gui but u can use start.bat like old way :)")
  };

  return (
    <Flex height="100vh" align="center" justify="center">
      <Stack spacing={5} direction="column">
        <Button
          onClick={() => {
            navigate("/all_map");
          }}
        >
          Choose 1 Agent for All Maps
        </Button>
        <Button
          onClick={() => {
            navigate("/each_map");
          }}
        >
          Choose a Different Agent for Each Map
        </Button>
        <Button
          onClick={() => {
            start();
          }}
        >
          Start
        </Button>
      </Stack>
    </Flex>
  );
};

export default Home;
