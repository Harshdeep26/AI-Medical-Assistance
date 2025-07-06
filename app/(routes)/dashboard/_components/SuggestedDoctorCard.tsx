import React from 'react'
import { doctorAgent } from './DoctorsAgentCard'
import Image from 'next/image'

type props = {
  doctorAgent: doctorAgent,
  setSelectedDoctor: any,
  selectedDoctor: doctorAgent
}

function SuggestedDoctorCard({ doctorAgent, setSelectedDoctor, selectedDoctor }: props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 p-5 border border-gray-600 rounded-lg 
    shadow-sm hover:shadow-xl transition-shadow duration-200 hover:border-blue-500 cursor-pointer 
    ${selectedDoctor?.id == doctorAgent?.id && 'border-blue-500 border-2'}`}
      onClick={() => setSelectedDoctor(doctorAgent)}>
      {/* {doctorAgent?.image && (
        <Image src={doctorAgent.image} alt={doctorAgent.specialist || "doctor"} width={70} height={70} className='rounded-full' />
      )} */}
      <Image src={doctorAgent?.image} alt={doctorAgent?.specialist} width={100} height={100} className='w-[50px] h-[50px] rounded-full' />
      {/* <Image src={doctorAgent?.image} alt={doctorAgent?.specialist} width={100} height={100} className='rounded-full' /> */}
      <h2 className='font-bold text-sm text-center'>{doctorAgent?.specialist}</h2>
      <p className='text-xs text-center line-clamp-2'>{doctorAgent?.description}</p>
    </div>
  )
}

export default SuggestedDoctorCard
