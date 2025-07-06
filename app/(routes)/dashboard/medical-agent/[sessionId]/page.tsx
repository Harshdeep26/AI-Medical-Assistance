"use client"
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorsAgentCard';
import { Circle, Languages, Loader, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import Provider from '@/app/provider';
import { toast } from 'sonner';

export type SessionDetail = {
  id: number,
  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: doctorAgent,
  createdon: string
}

type messages = {
  role: string,
  text: string
}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapi, setVapi] = useState<any>();
  const [currentRoll, setCurrentRoll] = useState<string | null>();
  const [liveTranscripts, setLiveTranscripts] = useState<string>();
  const [messages, setMessages] = useState<messages[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    sessionId && GetSessionDetails();
  }, [sessionId]);
  // const GetSessionDetails = async () => {
  //   const result = await axios.get(`/api/session-chat?sessionId/${sessionId}`);
  //   console.log(result.data);
  //   setSessionDetail(result.data);
  // }

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      console.log(result.data);
      setSessionDetail(result.data);
    } catch (err) {
      console.error("Error fetching session details:", err);
    }
  }

  const StartCall = async () => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapi(vapiInstance);

    const handleCallStart = () => {
      console.log('Call started');
      setCallStarted(true);
    };

    const handleCallEnd = () => {
      console.log('Call ended');
      setCallStarted(false);
    };

    const handleMessage = (message: any) => {
      if (message.type === 'transcript') {
        const { role, transcriptType, transcript } = message;
        if (transcriptType === 'partial') {
          setLiveTranscripts(transcript);
          setCurrentRoll(role);
        } else if (transcriptType === 'final') {
          setMessages(prev => [...prev, { role, text: transcript }]);
          setLiveTranscripts("");
          setCurrentRoll(null);
        }
      }
    };

    const handleSpeechStart = () => {
      console.log('Assistant started speaking');
      setCurrentRoll('Assistant');
    };

    const handleSpeechEnd = () => {
      console.log('Assistant stopped speaking');
      setCurrentRoll('User');
    };

    // Attach listeners
    vapiInstance.on('call-start', handleCallStart);
    vapiInstance.on('call-end', handleCallEnd);
    vapiInstance.on('message', handleMessage);
    vapiInstance.on('speech-start', handleSpeechStart);
    vapiInstance.on('speech-end', handleSpeechEnd);

    // Store cleanup method
    vapi.cleanUp = () => {
      vapiInstance.off('call-start', handleCallStart);
      vapiInstance.off('call-end', handleCallEnd);
      vapiInstance.off('message', handleMessage);
      vapiInstance.off('speech-start', handleSpeechStart);
      vapiInstance.off('speech-end', handleSpeechEnd);
    };

    vapiInstance.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID!);
  };

  const endCall = async () => {
    if (!vapi) return;

    vapi.stop();
    vapi.cleanUp?.(); // call cleanup method if exists

    setCallStarted(false);
    setVapi(null);

    console.log('Call ended');

    await GenerateReport();

    toast.success('Your Report generated successfully!');
    router.replace('/dashboard');
  };

  const GenerateReport = async () => {
    const result = await axios.post('/api/medical-report', {
      messages: messages,
      sessionDetail: sessionDetail,
      sessionId: sessionId
    })
    console.log(result.data);
    return result.data;
  }

  return (
    <div className='p-5 border rounded-3xl bg-secondary'>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className={`w-4 h-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`} /> {callStarted ? 'connected...' : 'Not Connected'}</h2>
        {/* {!StartCall ? <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className='w-4 h-4' /> Not Connected
        </h2> : <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center text-green-500'><Circle className='w-4 h-4' /> Connected</h2>} */}
        <h2 className='font-bold text-xl text-gray-400'>Time</h2>
      </div>

      {/* <div className='border-2 bordere-gray-400 w-[80px] h-[80px]'> */}
      {sessionDetail && <div className='flex items-center flex-col mt-10'>
        {/* <Image src={sessionDetail?.selectedDoctor?.image} alt={sessionDetail?.selectedDoctor?.specialist} width={80} height={80} /> */}
        <Image src={sessionDetail?.selectedDoctor?.image} alt={sessionDetail?.selectedDoctor?.specialist}
          width={120} height={120}
          className='h-[100px] h-[100px] object-cover rounded-full' />
        <h2 className='mt-2 text-lg'>{sessionDetail?.selectedDoctor?.specialist}</h2>
        <p className='text-sm text-gray-400'>AI Medical Voice Agent</p>

        <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
          {messages?.slice(-4).map((msg: messages, index) => (
            <h2 className='text-gray-400 p-2' key={index}>{msg.role} : {msg.text}</h2>
          ))}
          {liveTranscripts && liveTranscripts?.length > 0 && <h2 className='text-lg'>{currentRoll} : {liveTranscripts}</h2>}
        </div>

        {!callStarted ? <Button className='mt-20' onClick={StartCall}>
          {/* {loading? <Loader className='animate-spin'/> : } */}
          <PhoneCall /> Start Call
        </Button> : <Button className='mt-20' variant={'destructive'} onClick={endCall}>
          {/* {loading? <Loader className='animate-spin'/> :} */}
          <PhoneOff /> Disconnect</Button>
        }
      </div>}
    </div>
  )
}

export default MedicalVoiceAgent
