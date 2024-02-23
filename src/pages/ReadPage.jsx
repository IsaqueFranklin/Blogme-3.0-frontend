import { useEffect, useState, useContext } from "react";
import { useParams, Navigate, Link } from "react-router-dom"
import { UserContext } from '../UserContext';
import axios from 'axios';
import { format } from "date-fns";

export default function ReadPage() {

    const {ready, user, setUser} = useContext(UserContext);

    const {id} = useParams();
    const [post, setPost] = useState(null);
    const [modal, setModal] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [redirectlogin, setRedirectLogin] = useState(false);
    const [islike, setIslike] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState([]);

    const [email, setEmail] = useState('');
    const [inList, setInList] = useState(false);
    const [sent, setSent] = useState(false)

    useEffect(() => {
        if (!id) {
            return 'merda';
        }

        axios.get('/post/'+id).then(response => {
            setPost(response.data);
            setLikes(response.data.likes)
        })
    }, [id])

    useEffect(() => {
        checkLike();
    }, [likes])

    if(!post){
        return (
            <div className='mx-auto my-auto'>
                <img className='max-w-32 max-h-32' src='https://i.stack.imgur.com/kOnzy.gif' />
            </div>
        )
    }

    async function deletePost(ev) {
        ev.preventDefault();
        if (id) {
            await axios.post('/deletar/', {
                id, ...post
            })
            setRedirect(true);
        }
    }

    async function curtir(){
        if(user){
            likes.push(user._id)
            setIslike(true);
            await axios.put('/curtir', {
                id, likes
            })
        } else {
            setRedirectLogin(true);
        }
    }

    function checkLike(){
        if(user){
            for(let i=0; i <= likes.length; i=i+1){
                if(likes[i] === user._id){
                    setLiked(true);
                    break;
                }
            }
        }
    }

    async function enviarEmail(ev){
        ev.preventDefault();

        await axios.post('/enviar-email-teste', {
            ...post
        })
        
        await setSent(true);
        console.log(sent)
    }

    if(sent){
        window.location.reload();
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }

    if (redirectlogin) {
        return <Navigate to={'/login'} />
    }
    
    async function submitEmail(ev){
        ev.preventDefault();

        await axios.put('/add-email-to-email-list', {
            email, ...post
        });

        setInList(true);
    }


    if(modal) {
        return (
            <div className="items-center my-auto text-center">
                <h2 className="text-2xl text-[#0047AB] text-center font-semibold mb-8">Tem certeza que deseja deletar a publicação?</h2>
                <button onClick={deletePost} className="m-1 py-2 px-4 rounded rounded-lg bg-[#0047AB] text-white max-w-sm mt-2 mb-8 hover:bg-white hover:text-black">Sim</button>
                <button onClick={ev => setModal(false)} className="m-1 py-2 px-4 rounded rounded-lg bg-gray-800 text-white max-w-sm mt-2 mb-8 hover:bg-white hover:text-black">Cancelar</button>
            </div>
        )
    }

    return (
        <div className='mt-4 lg:px-8 sm:px-2'>
            {user?._id == post.owner?._id ? (
               <div className="">
                    {user?.superUser ? post.enviado || sent ? (<h2 className="text-[#0047AB] py-2 px-4 border border-[#0047AB] rounded-2xl">Newsletter enviada</h2>) : (
                        <button onClick={enviarEmail} className="m-1 py-2 px-4 rounded rounded-lg bg-[#0047AB] text-white max-w-sm mt-2 mb-8 hover:bg-white hover:text-black">Enviar newsletter</button>
                    ) : ''}
                    <a href={'/publicar/'+id} className="hover:no-undeline"><button className="m-1 py-2 px-4 rounded rounded-lg bg-[#0047AB] text-white max-w-sm mt-2 mb-8 hover:bg-white hover:text-black">Editar</button></a>
                    <button onClick={ev => setModal(true)} className="m-1 py-2 px-4 rounded rounded-lg bg-gray-800 text-white max-w-sm mt-2 mb-8 hover:bg-white hover:text-black">Deletar</button>
               </div>

            ) : ('')}
            <div className="mb-6">
                <h1 className='font-[Fira_Sans_Condensed] text-3xl lg:text-5xl font-semibold text-[#131316]'>{post.title}</h1>
                <h2 className='font-normal font-serif mt-2 text-lg lg:text-xl md:text-xl mb-6 text-gray-600'>{post.description}</h2>
                <p className="font-semibold">Escrito em {format(new Date(post.dia), 'dd/MM/yyyy')}</p>
                {post.modific ? (
                    <p className="font-semibold">Último modificado em {format(new Date(post.modific), 'dd/MM/yyyy')}</p>
                ) : ''}
            </div>
            <div className='flex'>
                <div className='rounded-2xl overflow-hidden'>
                    <div>
                        {post.photos?.[0] && (
                        <div>
                            <img className='cursor-pointer object-cover' src={import.meta.env.VITE_API_BASE_URL+'/uploads/'+post.photos?.[0]} alt="" />
                        </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-b">
                <div className="mt-8">
                    <p className="">Escrito por:</p>
                    <p className="text-xl">{post.owner?.name}</p>
                    <Link to={'/perfil/'+post.owner?.username}><p className="text-[#0047AB] mb-8">@{post.owner?.username}</p></Link>
                </div>
                <div className="flex mb-8 mt-4">
                    {post?.likes && user?._id ? 
                        islike || liked ? (
                            <button className="bg-white flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                </svg>

                                <p className="my-auto mx-2">{post.likes.length} likes</p>
                            </button>
                        ) : (
                        <button onClick={curtir} className="bg-white flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                            <p className="my-auto mx-2">{post.likes.length} likes</p>
                        </button>
                    ) : (
                        <button onClick={curtir} className="bg-white flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                            <p className="my-auto mx-2">{post.likes.length} likes</p>
                        </button>
                    )}
                </div>
            </div>
            <div className='content text-lg lg:text-xl lg:leading-relaxed leading-normal font-serif text-gray-800 mb-8 mt-8' dangerouslySetInnerHTML={{__html:post.content}} />
            {post.owner?.superUser ? 
                inList ?  (
                    <div className="my-16 border border-gray-700 rounded-2xl">
                        <div className="py-8 px-8">
                            <h2 className="text-2xl text-center mb-2 font-semibold text-[#0047AB]">Parabéns!</h2>
                            <h2 className="text-lg text-center leading-6 text-gray-900 mb-2">Você está inscrito na lista de emails de <Link to={'/perfil/'+post.owner?.username} className="text-[#0047AB]">@{post.owner.username}</Link>.</h2>
                            <h3 className="text-center text-md leading-6 text-gray-900">Fique atento à sua caixa de entrada.</h3>
                        </div>
                    </div>
                ) : (
                    <div className="my-16 border border-gray-700 rounded-2xl">
                        <form onSubmit={submitEmail} className="space-y-6" action="#" method="POST">
                        <div className="px-8 my-8">
                            <h2 className="text-2xl mb-2">Inscreva-se na lista de emails de <Link to={'/perfil/'+post.owner?.username} className="text-[#0047AB]">@{post.owner?.username}</Link>.</h2>
                            <label htmlFor="email" className="block mb-6 text-md font-medium leading-6 text-gray-900">
                            Se inscreva para receber as publicações de {post.owner?.name} direto no seu email.
                            </label>
                            <div className="mt-2">
                            <input
                                value={email}
                                onChange={ev => setEmail(ev.target.value)}
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Insira seu melhor email"
                                className="rounded-2xl  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            </div>
                            <button className="mt-6 text-white rounded-lg px-3 py-2 bg-[#0047AB] hover:bg-gray-700">Fazer parte da lista</button>
                        </div>
                        </form>
                    </div>
            ) : ''}
            <div className="my-16 border-t">
                <div className="text-center mx-auto my-auto items-center">
                    <h2 className="text-xl font-semibold my-8">Saiba mais sobre o escritor deste artigo</h2>
                    <div className='border border-gray-700 rounded-2xl my-auto p-6 lg:p-16 w-full lg:grid lg:grid-cols-2 text-center lg:text-left gap-16'>
                        <div>
                            <img className='rounded-full lg:h-60 lg:w-60 md:h-60 md:w-60 h-48 w-48 mx-auto aspect-square' src={'http://localhost:4000/uploads/'+post.owner?.photo[0]} />
                        </div>
                        <div className='mt-8'>
                            <h3 className='text-2xl'>{post.owner?.name}</h3>
                            <Link to={'/perfil/'+post.owner?.username}><h2 className='font-semibold text-[#0047AB] mb-2'>@{post.owner?.username}</h2></Link>
                            <h3>{post.owner?.bio}</h3>
                            <Link to={'/perfil/'+post.owner?.username}><button className="mt-6 text-white rounded-lg px-3 py-2 bg-[#0047AB] hover:bg-gray-700">Ver mais publicações</button></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}