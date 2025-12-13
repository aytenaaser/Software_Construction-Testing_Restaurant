'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/app/utils/ApiClient';
import { useAuth } from '@/app/context/authContext';
import { useRouter } from 'next/navigation';

interface Reservation {
  _id: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: string;
  tableId: string;
}

const MyReservationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get('/reservations/my-reservations');
        setReservations(response.data);
      } catch (err) {
        setError('Failed to fetch reservations.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchReservations();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Please log in to see your reservations.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Reservations</h1>
      <button
        onClick={() => router.push('/reservations/new')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        New Reservation
      </button>
      <button
        onClick={() => router.push('/reservations/tables')}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 ml-4"
      >
        Book by Table
      </button>
      {reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Time</th>
              <th className="py-2 px-4 border-b">Party Size</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => {
              const [day, month, year] = reservation.reservationDate.split('/');
              const date = new Date(`${year}-${month}-${day}`);
              const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <tr key={reservation._id}>
                  <td className="py-2 px-4 border-b">{formattedDate}</td>
                  <td className="py-2 px-4 border-b">{reservation.reservationTime}</td>
                  <td className="py-2 px-4 border-b">{reservation.partySize}</td>
                  <td className="py-2 px-4 border-b">{reservation.status}</td>
                  <td className="py-2 px-4 border-b">{reservation.tableNumber || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyReservationsPage;
