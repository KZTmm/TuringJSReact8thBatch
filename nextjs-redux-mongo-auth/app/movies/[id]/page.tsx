'use client';
import MovieDetailsUI from "@/app/components/movie/MovieDetailsUI";
import {Movie, useGetAllMoviesQuery} from "@/lib/features/movies/movieApi";
import {Review, useGetAllReviewsByMovieIdQuery} from "@/lib/features/review/reviewApi";
import ReviewList from "@/app/components/review/ReviewList";
import ReviewInput from "@/app/components/review/ReviewInput";
import {useRouter} from "next/navigation";
import IsAuth from "@/app/components/Auth/IsAuth";
const reviews:Review[] = [
    /*{
        "_id": "66643c5d3bfda65279a2e957",
        "movie": "66643a8e3bfda65279a2e947",
        "rating": 2,
        "review": "Good batman movie",

    },
    {
        "_id": "66643c663bfda65279a2e95a",
        "movie": "66643a8e3bfda65279a2e947",
        "rating": 4,
        "review": "not bad batman movie",

    }*/
    ];
function MovieDetailsPage({ params }: { params: { id: string } })
{

    const router = useRouter();
    const btnBackHandler = ()=>{
        router.push(`/movies`);
    };
    const { movie }:{todo:Movie} = useGetAllMoviesQuery(undefined,{
        selectFromResult: ({ data }) => ({
            movie: data?.find((movie) => movie._id === params.id),
        }),
    });

    return (<div>


        <MovieDetailsUI movie={movie}/>
        <ReviewInput movieId={params.id}/>
        <ReviewList movieId={params.id}/>
        <button type={"button"}
                className={"btn btn-primary"}
                onClick={btnBackHandler}>
            Back
        </button>
    </div>);
}
export default IsAuth(MovieDetailsPage)