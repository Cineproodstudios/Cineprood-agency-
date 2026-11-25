import React from 'react';
import ClientSocialHub from './ClientSocialHub';

interface TrabajoClientesProps {
  onVideoActiveChange?: (active: boolean) => void;
}

const TrabajoClientes: React.FC<TrabajoClientesProps> = ({ onVideoActiveChange }) => {
  return <ClientSocialHub onVideoActiveChange={onVideoActiveChange} />;
};

export default TrabajoClientes;
