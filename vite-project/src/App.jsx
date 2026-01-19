import React, { useReducer, useEffect, useCallback } from "react"
import SelectField from "./components/Select.jsx"
import listofMoodOption from "./store/mood.json"
import listofGenreOption from "./store/genre.json"
import "./App.css"

const reducer = (state, action) => {

  switch(action.type) {
    case "Set_Genre":
      return { ...state, genre: action.payload, mood: "" }
  
    case "Set_Mood":
      return { ...state, mood: action.payload, }
    
    case "Set_Level":
      return { ...state, level: action.payload, }
    
    case "Set_aiResponses":
      return { ...state, aiResponses: action.payload || []}
      default:
      return state;
  }
};

export default function App() {

  const [state, dispatch] = useReducer(reducer, {

    genre: "",
    mood: "",
    level: "",
    aiResponses: [] 
    }
   )

   const availableMoodBasedOnGenre =
    listofMoodOption[state.genre] || []

   const fetchRecommendations = useCallback(async() => {

    const { genre, mood, level } = state;

    if (!genre || !mood || !level) return;

    try {
    const GEMINI_API_KEY = 'AIzaSyCENSfDNcHbxUQYAupRtOibe-TWMcK0xDA';

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
  {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GEMINI_API_KEY}` 
    },
    body: JSON.stringify({
      prompt: {
        text: `Recommend 5 options for a ${level} ${genre} reader feeling ${mood}. Explain why.`
      },
      temperature: 0.7,
      candidate_count: 6
    })
  }
);

   const data = await response.json()

    dispatch({
      type: "Set_aiResponses",
      payload: data?.candidates || []
    })
   } catch (err) {
      console.log(err);
    }
  }, [state])
  
  useEffect(() => {
     fetchRecommendations()
  }, [fetchRecommendations])
  
  return(
       <section>
        <h1>Select Categories</h1>
       <SelectField
        placeholder="Genre"
        id="genre"
        options={listofGenreOption}
        value={state.genre}
        onSelect={(value) =>
        dispatch ({type: "Set_Genre" , payload: value})
          }
      />
        
       <SelectField
        placeholder="Mood"
        id="mood"
        options={availableMoodBasedOnGenre}
        value={state.mood}
         onSelect={(value) =>
        dispatch ({type: "Set_Mood" , payload: value})
         }
        />

        <SelectField
        placeholder="Level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={state.level}
        onSelect={(value) =>
        dispatch ({type: "Set_Level" , payload: value})
         }
        />

      <br />
         
        <button onClick={fetchRecommendations}>See Recommendation</button>

      <br />
      <br />
    
     {state.aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend?.content?.[0]?.text}</p>
        </details>
      ))}
      </section>
     )
      };