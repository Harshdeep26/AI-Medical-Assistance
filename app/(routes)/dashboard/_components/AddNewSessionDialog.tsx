"use client"
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorsAgentCard, { doctorAgent } from './DoctorsAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { SessionDetail } from '../medical-agent/[sessionId]/page'
import HistoryList from './HistoryList'

function AddNewSessionDialog() {
    const [notes, setNote] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>();
    const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();
    const router = useRouter();
    const [historyList, setHistoryList] = useState<SessionDetail[]>([]);

    const { has } = useAuth();
    const PaidUser = has && has({ plan: 'pro' });
    useEffect(() => {
        GetHistoryList();
    }, [])

    const GetHistoryList = async () => {
        const result = await axios.get('/api/session-chat?sessionId=all');
        console.log(result.data);
        setHistoryList(result.data);
    };

    const OnClickNext = async () => {
        setLoading(true);
        const result = await axios.post('/api/suggest-doctor', {
            notes: notes
        });
        console.log(result.data);
        setSuggestedDoctors(result.data);
        setLoading(false);
    }

    // const OnClickNext = async () => {
    //     setLoading(true);
    //     try {
    //         const result = await axios.post('/api/suggest-doctor', { notes: note });
    //         console.log("API Response:", result.data);
    //         if (Array.isArray(result.data)) {
    //             setSuggestedDoctors(result.data);
    //         } else if (Array.isArray(result.data?.doctors)) {
    //             setSuggestedDoctors(result.data.doctors);
    //         } else {
    //             console.error("Unexpected API format:", result.data);
    //             setSuggestedDoctors([]);
    //         }
    //     } catch (err) {
    //         console.error("Failed to fetch doctors:", err);
    //         setSuggestedDoctors([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const OnStartConsultation = async () => {
        setLoading(true);
        //save all information to the database
        const result = await axios.post('/api/session-chat', {
            notes: notes,
            selectedDoctor: selectedDoctor
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
        <div>
            <Dialog>
                <DialogTrigger><Button disabled={!PaidUser && historyList?.length>=1}>+ Start a Consultation</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Basic Details</DialogTitle>
                        <DialogDescription asChild>
                            {!suggestedDoctors ? <div>
                                <h2>Add Symptoms Or Any Other Details</h2>
                                <Textarea placeholder='Add Details Here...'
                                    className='h-[200px] mt-1'
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div> :
                                <div>
                                    <h2>Select The Doctor</h2>
                                    <div className='grid grid-cols-3 gap-5 pt-4'>
                                        {/* suggestedDoctor */}
                                        {suggestedDoctors && suggestedDoctors.map((doctor, index) => (
                                            <SuggestedDoctorCard doctorAgent={doctor} key={index}
                                                setSelectedDoctor={() => setSelectedDoctor(doctor)}
                                                //@ts-ignore
                                                selectedDoctor={selectedDoctor} />
                                            // <DoctorsAgentCard doctorAgent={doctor} key={index} />
                                        ))
                                            //:<div className='border-2 items-center justify-center'>
                                            //         <h2>openai API Call is not working currently, Please reload!!</h2>
                                            //     </div>
                                        }
                                    </div>
                                </div>
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                        {!suggestedDoctors ? <Button disabled={!notes || loading} onClick={() => OnClickNext()}>
                            Next {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />} </Button> :
                            <Button disabled={loading || !selectedDoctor} onClick={() => OnStartConsultation()}>Start Consultation
                                {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}</Button>
                        }
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewSessionDialog