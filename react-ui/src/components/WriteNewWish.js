import { useEffect } from "react";
import { useCookies } from 'react-cookie';
import Header from './Header';
import { Button } from 'react-bootstrap';

let WriteNewWish = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['authToken']);

    let generateWishes = async () => {
        console.log(cookies.authToken)
        
        if(typeof(cookies.authToken) != 'string'){
            alert('Please login first');
        }else if (window.confirm("You wanna create 100 new wishes ??? ") && window.confirm("Really ???")) {
            let listPromise = [];
            for (let i = 0; i < 30; ++i) {
                listPromise.push(fetch('https://picsum.photos/400/647').then(res => res.url));
            }
            console.log(listPromise)
            let listImg = await (async () => {
                return Promise.all(listPromise);
            })()

            console.log(listImg)

            listPromise = []

            for (let i = 0; i < listImg.length; ++i) {
                listPromise.push(fetch('/new-wish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${cookies.authToken}`
                    },
                    body: JSON.stringify({
                        wishContent : 'Developing and testing your web or mobile app can be hard without any data to work with. This is why Random Data API exists. Use any of our API endpoints and fetch data that will allow you faster development and testing cycle. All responses come with ID (integer) and UID (string).',
                        signature : 'GraphQL',
                        image : listImg[i]
                    })
                }).then((res) => res.json())
                .catch(err => {
                    console.log(err)
                }))
            }

            Promise.all(listPromise).then(res => { console.log(res); });
        }
    }

    return (
        <>
            <Header />
            <div style={{ paddingTop: '100px', textAlign: 'center' }}>
                <Button onClick={generateWishes}>Write new wishes</Button>
            </div>
        </>
    )
}
export default WriteNewWish;