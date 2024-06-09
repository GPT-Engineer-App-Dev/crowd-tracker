import React, { useEffect, useState } from "react";
import { Container, Text, VStack, Box, Heading } from "@chakra-ui/react";
import Peer from "simple-peer";

const Index = () => {
  const [peers, setPeers] = useState([]);
  const [userCount, setUserCount] = useState(1); // Start with 1 to count the current user

  useEffect(() => {
    try {
      const peer = new Peer({
        initiator: location.hash === "#init",
        trickle: false,
      });

      peer.on("signal", (data) => {
        console.log("SIGNAL", JSON.stringify(data));
      });

      peer.on("connect", () => {
        console.log("CONNECTED");
        setPeers((prevPeers) => [...prevPeers, peer]);
        updateUserCount(peers.length + 1); // Update user count on connect
      });

      peer.on("data", (data) => {
        console.log("data: " + data);
        const message = JSON.parse(data);
        if (message.type === "user-count") {
          setUserCount(message.count);
        }
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
      });

      peer.on("close", () => {
        setPeers((prevPeers) => prevPeers.filter(p => p !== peer));
        updateUserCount(peers.length); // Update user count on disconnect
      });

      // Simulate receiving a signal from another peer
      setTimeout(() => {
        try {
          const otherPeer = new Peer();
          otherPeer.on("signal", (data) => {
            peer.signal(data);
          });
          peer.signal(otherPeer.signal);
        } catch (err) {
          console.error("Error during peer signaling:", err);
        }
      }, 1000);

      return () => {
        peer.destroy();
      };
    } catch (err) {
      console.error("Error initializing peer:", err);
    }
  }, []);

  useEffect(() => {
    peers.forEach((peer) => {
      peer.send(JSON.stringify({ type: "user-count", count: userCount }));
    });
  }, [userCount, peers]);

  const updateUserCount = (count) => {
    setUserCount(count);
    peers.forEach((peer) => {
      peer.send(JSON.stringify({ type: "user-count", count }));
    });
  };

  return (
    <Container
      centerContent
      maxW="container.md"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <VStack spacing={4}>
        <Heading fontSize="4xl">P2P User Count</Heading>
        <Box
          p={4}
          borderWidth={1}
          borderRadius="lg"
          width="100%"
          textAlign="center"
        >
          <Text fontSize="2xl">Active Users: {userCount}</Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Index;