import React, { useRef, useState, useEffect } from "react"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import * as tf from '@tensorflow/tfjs';

import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../components/handsigns"
import About from "../components/about"

import { Text, Heading, Button, Stack, Container, Box, VStack, ChakraProvider } from "@chakra-ui/react"
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

export default function Home() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [camState, setCamState] = useState("on")
  const [sign, setSign] = useState(null)

  async function runHandpose() {
    const net = await handpose.load()
    setInterval(() => {
      detect(net)
    }, 150)
  }

  async function detect(net) {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      const hand = await net.estimateHands(video)

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          Handsigns.aSign,
          Handsigns.bSign,
          Handsigns.cSign,
          Handsigns.dSign,
          Handsigns.eSign,
          Handsigns.fSign,
          Handsigns.gSign,
          Handsigns.hSign,
          Handsigns.iSign,
          Handsigns.jSign,
          Handsigns.kSign,
          Handsigns.lSign,
          Handsigns.mSign,
          Handsigns.nSign,
          Handsigns.oSign,
          Handsigns.pSign,
          Handsigns.qSign,
          Handsigns.rSign,
          Handsigns.sSign,
          Handsigns.tSign,
          Handsigns.uSign,
          Handsigns.vSign,
          Handsigns.wSign,
          Handsigns.xSign,
          Handsigns.ySign,
          Handsigns.zSign,
        ])

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5)

        if (estimatedGestures.gestures && estimatedGestures.gestures.length > 0) {
          const confidence = estimatedGestures.gestures.map(p => p.confidence)
          const maxConfidence = confidence.indexOf(Math.max(...confidence))
          const detectedGesture = estimatedGestures.gestures[maxConfidence].name

          if (detectedGesture !== sign) {
            setSign(detectedGesture)
            speak(detectedGesture)
          }
        }
      } else {
        if (sign !== null) {
          setSign(null)
        }
      }

      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
    }
  }

  let isSpeaking = false;  // Флаг для отслеживания, идет ли речь

  function speak(text) {
    const synth = window.speechSynthesis
    if (isSpeaking || !text) return
  
    isSpeaking = true;  // Устанавливаем флаг, что речь идет
  
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "kk-KZ"  // Казахский язык
    utter.rate = 1
  
    utter.onend = () => {
      isSpeaking = false;  // Сбрасываем флаг, когда речь завершена
    }
  
    synth.speak(utter)
  }
  
  function turnOffCamera() {
    if (camState === "on") {
      setCamState("off")
    } else {
      setCamState("on")
    }
  }

  useEffect(() => {
    runHandpose()
  }, [])

  return (
    <ChakraProvider>
      <Box bgColor="#5784BA">
        <Container centerContent maxW="xl" height="100vh" pt="0" pb="0">
          <VStack spacing={4} align="center">
            <Box h="20px"></Box>
            <Heading as="h3" size="md" color="white" textAlign="center"></Heading>
            <Box h="20px"></Box>
          </VStack>

          <Heading as="h1" size="lg" color="white" textAlign="center">
            🧙‍♂️ Жестовый Ассистент Загружается...
          </Heading>

          <Box id="webcam-container">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} />
            ) : (
              <div id="webcam" background="black"></div>
            )}
            {sign && (
              <div
                style={{
                  position: "absolute",
                  marginLeft: "auto",
                  marginRight: "auto",
                  right: "calc(50% - 50px)",
                  bottom: 100,
                  textAlign: "-webkit-center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}
              >
                {sign}
              </div>
            )}
          </Box>

          <canvas id="gesture-canvas" ref={canvasRef} style={{}} />

          <Stack id="start-button" spacing={4} direction="row" align="center">
          <Button
            leftIcon={
              camState === "on" ? (
                <RiCameraFill size={20} />
              ) : (
                <RiCameraOffFill size={20} />
              )
            }
            onClick={turnOffCamera}
            colorScheme="orange"
          >
            Camera
          </Button>
          <About />
        </Stack>
          
        </Container>
      </Box>
    </ChakraProvider>
  )
}
