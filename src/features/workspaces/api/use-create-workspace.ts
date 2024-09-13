import { useCallback, useMemo, useState } from 'react';

import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

type RequestType = { name: string };
type ResponseType = Id<'workspaces'> | null;

type Options = {
	onSuccess?: (data: ResponseType) => void;
	onError?: (err: Error) => void;
	onSettled?: () => void;
	throwError?: boolean;
};

export const useCreateWorkspace = () => {
	const [data, setData] = useState<ResponseType>(null);
	const [error, setError] = useState<Error | null>(null);
	const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null);

	const isPending = useMemo(() => status === 'pending', [status]);
	const isSuccess = useMemo(() => status === 'success', [status]);
	const isError = useMemo(() => status === 'error', [status]);
	const isSettled = useMemo(() => status === 'settled', [status]);

	const mutation = useMutation(api.workspaces.create);

	const mutate = useCallback(
		async (values: RequestType, options?: Options) => {
			try {
				setData(null);
				setError(null);
				setStatus('pending');

				const res = await mutation(values);
				options?.onSuccess?.(res);
				return res;
			} catch (err) {
				options?.onError?.(err as Error);

				if (options?.throwError) {
					throw err;
				}
			} finally {
				setStatus('settled');
				options?.onSettled?.();
			}
		},
		[mutation]
	);

	return {
		mutate,
		data,
		error,
		isPending,
		isSuccess,
		isError,
		isSettled,
	};
};