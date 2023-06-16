import React, { useEffect, useState, Fragment } from "react";
import AgentBox from "./components/AgentsBox";
import { Button, Center, Box, Flex, Spacer, Select } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";

function EachMap() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAgentsData = (data) => {
      setAgents(data);
    };

    const handleMapsData = (data) => {
      setMaps(data);
      setSelectedMap(data[0]);
    };

    // last step
    const handleConfigData = (configData, agentsData, mapsData) => {
      setConfig(configData);
      if (mapsData[0].name in configData) {
        let agentName = configData[mapsData[0].name];
        agentsData.map((agent, index) => {
          if (agent.name == agentName) {
            setSelectedAgent(agent);
            setSelectedAgentIndex(index);
          }
        });
      }
    };

    invoke("get_agents")
      .then((data) => {
        handleAgentsData(data);
        invoke("get_maps")
          .then((data1) => {
            handleMapsData(data1);
            invoke("get_config")
              .then((data2) => {
                handleConfigData(data2, data, data1);
              })
              .catch((error) => {
                alert(error);
              });
          })
          .catch((error) => {
            alert(error);
          });
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const [agents, setAgents] = useState([]);
  const [maps, setMaps] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);

  const onAgentSelect = (index) => {
    setSelectedAgent(agents[index]);
    setSelectedAgentIndex(index);
  };

  const onMapSelect = (event) => {
    setSelectedMap(maps[event.target.value]);

    let mapName = maps[event.target.value].name;

    if (mapName in config) {
      let agentName = config[mapName];
      agents.map((agent, index) => {
        if (agent.name == agentName) {
          setSelectedAgent(agent);
          setSelectedAgentIndex(index);
        }
      });
    }
  };

  const onSave = () => {
    if (selectedAgent == null) return;
    let agentName = selectedAgent.name;
    let mapName = selectedMap.name;
    invoke("set_agent_for_map", { agent: agentName, map: mapName })
      .then(() => {
        let conf = config;
        conf[mapName] = agentName;
        setConfig(conf);
        alert("Done");
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
        bgImage={selectedMap != null ? selectedMap.full_portrait : ""}
        filter="drop-shadow(0 0 10px rgba(0, 0, 0, 1))"
        bgSize="100% 100%"
        bgPosition="cover"
        bgRepeat="no-repeat"
        style={{
          position: "relative",
        }}
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          bgImage={selectedAgent != null ? selectedAgent.full_portrait : ""}
          bgSize="contain"
          bgRepeat="no-repeat"
          bgPosition="center"
          filter="drop-shadow(0 0 15px rgba(0, 0, 0, 1))"
        />

        <Center>
          <Select
            variant=""
            onChange={onMapSelect}
            filter="drop-shadow(0 0 5px rgba(0, 0, 0, 1))"
          >
            {maps.map((map, index) => (
              <option value={index}>{map.name}</option>
            ))}
          </Select>
        </Center>
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
              onSelect={onAgentSelect}
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

export default EachMap;
