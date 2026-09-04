import React from 'react';
import { useToast } from '@/components/ui/toast';
import { registerGlobalToast } from './toastService';

export const ToastRegistrar = () => {
     const toast = useToast();

     React.useEffect(() => {
          registerGlobalToast(toast);
     }, [toast]);

     return null;
};
