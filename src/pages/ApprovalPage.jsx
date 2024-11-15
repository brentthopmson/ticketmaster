import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Hero from '../components/Hero';
import Promotions from '../components/Promotions';
import Footer from '../components/Footer';
import Loading from '../components/Loading';

const ApprovalPage = () => {
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(hardcodedTicketDetails);
  const [email, setEmail] = useState('');

  // Hardcoded ticket details
  const hardcodedTicketDetails = {
    coverImage: 'https://snworksceo.imgix.net/cav/5b854ca2-7f1d-4130-bc36-2456bbfac741.sized-1000x1000.jpg?w=1000',
    eventName: 'BILLIE EILISH: HIT ME HARD AND SOFT: THE TOUR',
    date: 'Sun, Dec 15',
    time: '7:00 PM',
    venue: 'Kia Forum',
    location: 'Inglewood, CA',
    section: '126',
    row: '7',
    seat: '1',
  };

  const onSubmit = (keyword) => {
    history.push(`/search?keyword=${keyword}`);
  };


  useEffect(() => {
    const { token, email } = getTokenAndEmail();
    console.log(token);
    setEmail(email);

    const validateToken = async () => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxcoCDXcWlKPDbttlFf2eR_EeuMkfupy5dfgIOklM1ShEZ30gfD3wzZZOxkKV4xIWEl/exec', {
          method: 'GET', // GET request to validate token
          headers: {
            'Content-Type': 'text/plain', // Use plain text content type
          },
        });
        const data = await response.json();
        console.log(data);

        // Check for matching token and blank stamp
        const ticket = data.find(item => item.token === token && item.stamp === '');

        if (ticket) {
          setIsApproved(true);
          setTicketDetails({ ...hardcodedTicketDetails, ...ticket });
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsApproved(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [location]);

  useEffect(() => {
    if (isApproved) {
      const updateStamp = async () => {
        try {
          const { token, email } = getTokenAndEmail();
          // Create the plain text data to send
          const plainTextData = `token=${token}&email=${email}&stamp=${new Date().toISOString()}`;

          const response = await fetch('https://script.google.com/macros/s/AKfycbxcoCDXcWlKPDbttlFf2eR_EeuMkfupy5dfgIOklM1ShEZ30gfD3wzZZOxkKV4xIWEl/exec', {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain', // Send as plain text
            },
            body: plainTextData, // Send the data as plain text
          });

          if (!response.ok) {
            throw new Error('Failed to update stamp');
          }
        } catch (error) {
          console.error('Error updating stamp:', error);
        }
      };

      updateStamp();
    }
  }, [isApproved]);

  const getTokenAndEmail = () => {
    const pathParts = location.pathname.split('/');
    // Assuming the URL is in the format: /approval/:token/:email
    return { token: pathParts[2], email: pathParts[3] };
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (isApproved === false) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-bold">Ticket request has been cancelled or token is invalid.</h2>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Hero onSubmit={onSubmit} />
      <Promotions />
      <div className="p-4 bg-white max-w-xl mx-auto">
        <div className="relative shadow-lg rounded-lg overflow-hidden">
          {isApproved && (
            <div className="absolute top-0 left-0 w-full bg-black bg-opacity-75 text-white text-center p-2 z-10">
              <p>
                This ticket is being transferred to <strong>{email}</strong>. The ownership transfer can take up to 10 minutes to complete unless retracted by the initial owner.
              </p>
            </div>
          )}
          <img className="w-full h-48 object-cover" src={ticketDetails.coverImage} alt={ticketDetails.eventName} />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{ticketDetails.eventName}</h2>
            <p className="text-gray-600 mb-1">{ticketDetails.date} @ {ticketDetails.time}</p>
            <p className="text-gray-600 mb-4">{ticketDetails.venue}, {ticketDetails.location}</p>
            <div className="text-gray-800">
              <p>Section {ticketDetails.section}, Row {ticketDetails.row}, Seat {ticketDetails.seat}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
};

export default ApprovalPage;
