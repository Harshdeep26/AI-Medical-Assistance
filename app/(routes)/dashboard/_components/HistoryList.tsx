"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import AddNewSessionDialog from './AddNewSessionDialog';
import axios from 'axios';
import HistoryTable from './HistoryTable';
import { SessionDetail } from '../medical-agent/[sessionId]/page';

export function HistoryList() {
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);

  useEffect(() => {
    GetHistoryList();
  }, [])

  const GetHistoryList = async () => {
    const result = await axios.get('/api/session-chat?sessionId=all');
    console.log(result.data);
    setHistoryList(result.data);
    // const res = await fetch('/api/history?sessionId=all');
    // const data = await res.json();
    // setHistoryList(data);
  };
  return (
    <div className='mt-10'>
      {!historyList.length ?
        <div className='flex items-center flex-col justify-center p-7 border border-dashed rounded-2xl border-2'>
          <Image src={'/thumbnail.png'} alt='hello' width={150} height={150} />
          <h2 className='font-bond text-xl mt-5'>No Recent Consultation</h2>
          <p>Its looks like you haven't consulted with any doctor yet.</p>
          <AddNewSessionDialog />
        </div> : <div>
          <HistoryTable historyList={historyList} />
        </div>
      }
    </div>
  )
}

export default HistoryList