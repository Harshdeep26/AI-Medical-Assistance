"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { IconArrowRight } from '@tabler/icons-react'
import axios from 'axios'
import { Loader2, Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { SessionDetail } from '../medical-agent/[sessionId]/page'

export type doctorAgent = {
  id: number,
  specialist: string,
  description: string,
  image: string,
  agentPrompt: string,
  voiceId: string,
  subscriptionRequired: boolean
}

type props = {
  doctorAgent: doctorAgent
}

function DoctorsAgentCard({ doctorAgent }: props) {
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);

  const { has } = useAuth();
  const PaidUser = has && has({ plan: 'pro' });
  console.log(PaidUser);

  const router = useRouter();

  useEffect(() => {
    GetHistoryList();
  }, [])
  const GetHistoryList = async () => {
    const result = await axios.get('/api/session-chat?sessionId=all');
    console.log(result.data);
    setHistoryList(result.data);
  };

  const OnStartConsultation = async () => {
    setLoading(true);
    //save all information to the database
    const result = await axios.post('/api/session-chat', {
      selectedDoctor: doctorAgent
    });
    console.log(result.data);
    if (result.data?.sessionId) {
      console.log(result.data.sessionId);
      //route new conversation screen

      router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
    }
    setLoading(false);
  }

  return (
    <div className='relative'>
      {doctorAgent?.subscriptionRequired && <Badge className='absolute m-2 right-0'>
        Premium
      </Badge>}
      <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300} className='w-full object-cover h-[250px] rounded-xl' />
      <h2 className='font-bold mt-1'>{doctorAgent.specialist}</h2>
      <p className='line-clamp-2 text-sm text-gray-500'>{doctorAgent.description}</p>
      <Button className='w-full mt-2' disabled={!PaidUser && historyList?.length >= 1} onClick={OnStartConsultation}>Start Consultation{loading ? <Loader2Icon className='animate-spin' /> : <IconArrowRight />}</Button>
    </div>
  )
}

export default DoctorsAgentCard
