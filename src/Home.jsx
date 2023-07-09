import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select, Flex, Stack, Spinner } from "@chakra-ui/react";
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
  const [isInstalling, setIsInstalling] = useState(false);

  const installDependencies = () => {
    setIsInstalling(true);
    invoke("install_dependenies")
      .then(() => {
        setIsInstalling(false);
      })
      .catch((error) => {
        setIsInstalling(false);
        alert(error);
      });
  };

  const onProfileSelect = (event) => {
    setActiveProfile(event.target.value);
    invoke("set_active_profile", { name: profiles[event.target.value] }).catch(
      (error) => {
        alert(error);
      }
    );
  };

  const onStart = () => {
    invoke("start").catch((error) => {
      alert(error);
    });
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
            <option value={index} key={index}>
              {profile}
            </option>
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
            installDependencies();
          }}
          isLoading={isInstalling}
          loadingText="Installing"
        >
          {isInstalling ? (
            <Spinner color="white" size="sm" />
          ) : (
            "Install Dependencies"
          )}
        </Button>
        <Button
          onClick={() => {
            onStart();
          }}
          isDisabled={isInstalling}
        >
          Start
        </Button>
      </Stack>
    </Flex>
  );
};

export default Home;
