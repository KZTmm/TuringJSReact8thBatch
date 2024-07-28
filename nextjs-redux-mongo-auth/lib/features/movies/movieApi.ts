import {createApi} from "@reduxjs/toolkit/query/react";
import {fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export interface Director
{
    "_id":string,
    "name":string,
    "phoneNo":string,
}
export interface Movie {
    "_id":string,
    "title": string,
    "director":Director,
    "year": number,
}
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log('BACKEND URL ',BACKEND_URL);
export const moviesApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
        prepareHeaders: (headers, {getState}) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            const state = (getState() as RootState);
            console.log('prepareHeaders State ', state);
            if(state.auth.token)
            {
                headers.set('Authorization', 'Bearer '+state.auth.token);
            }
            return headers;

        }
    }),
    reducerPath: "moviesApi",
    // Tag types are used for caching and invalidation.
    tagTypes: ["Movies","Reviews","Auth"],
    endpoints: (build) => ({
        // Supply generics for the return type (in this case `QuotesApiResponse`)
        // and the expected query argument. If there is no argument, use `void`
        // for the argument type instead.
        getAllMovies: build.query<Movie[],any>({
            query: () => `/movies`,
            providesTags:()=>['Movies']

        }),
        //Pessimistic
        addMovie:build.mutation<Movie,Partial<Movie>>({
            query: (movie:Partial<Movie>) => ({
                url: `/movies`,
                method: 'POST',
                body:movie,
            }),
            //invalidatesTags:["Todos"]

            async onQueryStarted(movie:Movie, { dispatch, queryFulfilled }) {
                console.log('onQueryStarted Movie ',movie);

                try {
                    const {data:savedMovie} = await queryFulfilled
                    console.log('Saved savedTodo ',savedMovie);
                    const patchResult = dispatch(
                        moviesApiSlice.util.updateQueryData('getAllMovies', undefined, (draft) => {
                            console.log('Draft ',draft);
                            draft.push(savedMovie);
                            return draft;
                        }),
                    );
                } catch {
                    //patchResult.undo();
                }
            }
        }),
        updateMovie:build.mutation<Movie,Movie>({
            query: (movie:Movie) => ({
                url: `/movies/${movie._id}`,
                method: 'PUT',
                body:movie,

            }),
            async onQueryStarted(movie:Movie, { dispatch, queryFulfilled }) {
                console.log('onQueryStarted update Movie ',movie);
                const patchResult = dispatch(
                    moviesApiSlice.util.updateQueryData('getAllMovies', undefined, (draft) => {
                        console.log('Draft ',draft);
                        draft = draft.map(mv=>mv._id == movie._id? movie: mv);
                        return draft;
                    }),
                );
                console.log('Patch done');
                try {

                    const {data:updatedMovie} = await queryFulfilled
                    console.log('Update Movie  response',updatedMovie);

                } catch {
                    patchResult.undo();
                }
            }

        }),
        deleteMovie:build.mutation<Movie, string>({
            query: (id:string) => ({
                url: `/movies/${id}`,
                method: 'DELETE',

            }),

            //Optimistic

            async onQueryStarted(id:string , { dispatch, queryFulfilled }) {
                console.log('Id ',id);
                const patchResult = dispatch(
                    moviesApiSlice.util.updateQueryData('getAllMovies', undefined, (draft) => {
                        //console.log('Draft ',draft);
                        draft = draft.filter(movie=>movie._id != id);
                        //console.log('Draft ',draft);
                        return draft;
                    }),
                );
                try {
                    const {data:deletedMovie} = await queryFulfilled
                    console.log('Deleted movie ',deletedMovie);
                } catch {
                    patchResult.undo();
                }
            }
        }),

    }),
});


export const { useGetAllMoviesQuery , useAddMovieMutation,useUpdateMovieMutation,useDeleteMovieMutation} = moviesApiSlice;