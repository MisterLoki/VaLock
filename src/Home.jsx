import React, { useEffect , useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select, Flex, Stack } from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api/tauri";

const Home = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleProfiles = (allProfiles, active) => {
      let activeIndex = 0;
      allProfiles.forEach((item, index) => {
        if (item == active) {
          activeIndex = index;
        }
      });
      setActiveProfile(activeIndex);
      setProfiles(allProfiles);
    };

    invoke("get_profiles")
      .then((allProfiles) => {
        invoke("get_active_profile")
          .then((active_profile) => {
            handleProfiles(allProfiles, active_profile);
          })
          .catch((error) => {
            alert(error);
          });
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(0);

  const start = () => {
    alert(
      "In this version can not start via gui but u can use start.bat like old way :)"
    );
  };

  const onProfileSelect = (event) => {
    setActiveProfile(event.target.value)
    invoke("set_active_profile", {name: profiles[event.target.value]}).then().catch((error) => {alert(error);});
  };

  return (
    <Flex height="100vh" align="center" justify="center">
      <Stack spacing={5} direction="column">
        <Select
          variant=""
          onChange={onProfileSelect}
          filter="drop-shadow(0 0 5px rgba(0, 0, 0, 1))"
          value={activeProfile}
        >
          {profiles.map((profile, index) => (
            <option value={index} key={index}>{profile}</option>
          ))}
        </Select>
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
            navigate("/profile");
          }}
        >
          Profile Setting
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
