'use client';

import React, { useState } from 'react';
import axiosInstance from '@/app/utils/ApiClient';
import { useAuth } from '@/app/context/authContext';
import { useRouter } from 'next/navigation';
import Table from './Table';

const TableReservationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [reservationDate, setReservationDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tables, setTables] = useState([]);
  const router = useRouter();

  const handleTableClick = (tableId: string) => {
    router.push(`/reservations/new?tableId=${tableId}&date=${reservationDate}&startTime=${startTime}&endTime=${endTime}&partySize=${partySize}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to view table availability.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const date = new Date(reservationDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const response = await axiosInstance.get('/reservations/availability/check', {
        params: {
          date: formattedDate,
          startTime,
          endTime,
          partySize,
        },
      });
      setTables(response.data?.tables || []);
    } catch (err: any) {
      console.error('Failed to fetch table availability:', err);
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
      setError(`Failed to fetch table availability: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view table availability.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Table Reservation</h1>
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-4">
        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="reservationDate" className="block text-gray-700 font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              id="reservationDate"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-gray-700 font-bold mb-2">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-gray-700 font-bold mb-2">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="partySize" className="block text-gray-700 font-bold mb-2">
              Party Size
            </label>
            <input
              type="number"
              id="partySize"
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
              min="1"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
          disabled={submitting}
        >
          {submitting ? 'Searching...' : 'Search Availability'}
        </button>
      </form>

      {/* 2D/3D view will go here */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Table Layout</h2>
        <div className="flex justify-center mb-4">
          <div className="flex items-center mr-4">
            <div className="w-4 h-4 bg-green-400 mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-4 h-4 bg-gray-400 mr-2"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 mr-2"></div>
            <span>Cannot Accommodate</span>
          </div>
        </div>
        <div className="relative" style={{ height: '500px' }}>
          {tables.map((table) => (
            <Table key={table._id} table={table} onClick={handleTableClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableReservationPage;

