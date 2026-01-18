import React , {useState, useReducer, useEffect, useCallback} from "react"
import SelectField from "./components/Select.jsx" 
import listOfGenreOption from "./store/genre.json"
import listOfMoodOption from "./store/mood.json"

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_GENRE':
      return { ...state, genre: action.payload, mood: "" };
    case 'SET_MOOD':
      return { ...state, mood: action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_AI_RESPONSES':
      return { ...state, aiResponses: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    genre: "",
    mood: "",
    level: "",
    aiResponses: []
  });

  const { genre, mood, level, aiResponses } = state;

  const availableMoodBasedOnGenre = listOfMoodOption[genre]  []

  const fetchRecommendations = async () => {
    if (!genre  !mood  !level) return;

    try {
      const GEMINI_API_KEY = 'AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I'; 
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`
                  }
                ]
              }
            ]
          })
        }
      )
      const data = await response.json()
      console.log(data?.candidates)
      setAiResponses(...aiResponses.data?.candidates  [])
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <section>
      <h1>Book Recommender</h1>

      <SelectField
        placeholder="Please select a genre"
        id="genre"
        options={listOfGenreOption}
        value={genre}
        onSelect={setGenre}
      />

      <SelectField
        placeholder="Please select a mood"
        id="mood"
        options={availableMoodBasedOnGenre}
        value={mood}
        onSelect={setMood}
      />

      <SelectField
        placeholder="Please select your level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={level}
        onSelect={setLevel}
      />

      <button onClick={fetchRecommendations}>Get Recommendation</button>

      <br />
      <br />

      {aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend?.content?.[0]?.text}</p>
        </details>
      ))}
    </section>
  )
  }