
import api from './api';

const studentService = {
    getMyPendingRequests : async (userId: string): Promise<number> => {
        const response = await api.get(`student/clubs/pending/${userId}`);
        return response.data;
    },
}

export default studentService;