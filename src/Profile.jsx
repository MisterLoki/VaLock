import React, { useState, useEffect } from "react";
// import { Button, Flex, Stack, Input } from "@chakra-ui/react";
import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Stack,
  Spacer,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [update, setUpdate] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileIndex, setSelectedProfile] = useState(0);

  const handleChange = (event) => setName(event.target.value);

  useEffect(() => {
    const handleProfiles = (allProfiles) => {
      setProfiles(allProfiles);
    };

    invoke("get_profiles")
      .then((allProfiles) => {
        setProfiles(allProfiles);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const addProfile = (profileName) => {
    invoke("add_profile", { name : profileName })
      .then(() => {
        profiles.push(profileName);
        setName("");
      })
      .catch((error) => {
        alert(error);
      });
  };

  const deleteProfile = (profileIndex) => {
    invoke("delete_profile", { name : profiles[profileIndex] })
      .then(() => {
        profiles.splice(profileIndex, 1);
        setSelectedProfile(0);
        setUpdate(!update);
      })
      .catch((error) => {
        alert(error);
      });
  };

  const onProfileSelect = (event) => {
    setSelectedProfile(event.target.value);
  };

  return (
    <Flex
      height="100vh"
      align="center"
      justify="center"
      marginLeft="10%"
      marginRight="10%"
    >
      <Box width="40%">
        <Stack spacing={4}>
          <Input
            placeholder="Enter profile name"
            value={name}
            onChange={handleChange}
          />
          <Button
            onClick={() => {
              addProfile(name);
            }}
          >
            Add Profile
          </Button>
        </Stack>
      </Box>
      <Spacer />
      <Box width="40%">
        <Stack spacing={4}>
          <Select
            variant=""
            onChange={onProfileSelect}
            value={selectedProfileIndex}
            filter="drop-shadow(0 0 5px rgba(0, 0, 0, 1))"
          >
            {profiles.map((profile, index) => (
              <option value={index} key={index}>{profile}</option>
            ))}
          </Select>
          <Button onClick={() => {deleteProfile(selectedProfileIndex);}}>Delete Profile</Button>
        </Stack>
      </Box>
      <Box position="absolute" bottom={4}>
        <Button
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </Button>
      </Box>
    </Flex>
  );
}

export default Profile;
