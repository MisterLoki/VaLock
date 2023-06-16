import React, { useEffect, useState, Fragment } from "react";
import AgentBox from "./components/AgentsBox";
import { Button, Center, Box, Flex, Spacer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";

function AllMap() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDataFromRust = (data) => {
      setAgents(data);
    };

    invoke("get_agents")
      .then(handleDataFromRust)
      .catch((error) => {
        alert(error);
      });
  }, []);

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(null);

  const onSelect = (index) => {
    setSelectedAgent(agents[index]);
    setSelectedAgentIndex(index);
  };

  const onSave = () => {
    if (selectedAgent == null) return;
    let name = selectedAgent.name;
    invoke("set_agent_for_all_maps", { name })
      .then(() => {
        alert("done");
        navigate("/");
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <Fragment>
      <Flex
        direction="column"
        align="center"
        justify="space-between"
        h="100vh"
        p="4"
        bgImage={selectedAgent != null ? selectedAgent.full_portrait : ""}
        filter="drop-shadow(0 0 10px rgba(0, 0, 0, 1))"
        bgSize="contain"
        bgPosition="center"
        bgRepeat="no-repeat"
        style={{
          position: "relative",
        }}
      >
        <Box flexGrow={1}></Box>
        <Box
          w="100%"
          position="fixed"
          bottom="0"
          p="4"
          sx={{
            background: "rgba(128, 128, 128, 0.6)",
          }}
        >
          <Center>
            <AgentBox
              agents={agents}
              onSelect={onSelect}
              selectedIndex={selectedAgentIndex}
            />
          </Center>
          <Flex justify="space-evenly" mt="10">
            <Button onClick={() => navigate("/")}>Cancel</Button>
            <Button onClick={() => onSave()}>Save</Button>
          </Flex>
        </Box>
      </Flex>
    </Fragment>
  );
}

export default AllMap;
