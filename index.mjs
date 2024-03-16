import fetch from 'node-fetch'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()
const app=express()
app.use(express.json())
app.use(cors())

app.get('/get-details', async (req, res) => {
    try {
        const response = await fetch("https://api.github.com/users/2110030392santhosh/repos", {
            headers: {
                "Accept":process.env.ACCEPT,
                "X-GitHub-Api-Version": process.env.XGITHUBAPIVERSION,
                "Authorization": process.env.AUTH
            }
        });

        if (!response.ok) {
            console.log(response)
            throw new Error(`Failed to fetch repository data: ${response.status} ${response.statusText}`);
        }

        const repositoryData = await response.json();

        // Array to store promises of fetch calls for readme data
        const readmePromises = repositoryData.map(repo => {
            return fetch(`https://api.github.com/repos/2110030392santhosh/${repo.name}/readme`, {
                headers: {
                    "Accept":process.env.ACCEPT,
                    "Authorization": process.env.AUTH
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch readme data for ${repo.name}: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error(`Error fetching readme data for ${repo.name}: ${error}`);
                return null; // Return null for failed requests
            });
        });

        // Wait for all fetch calls to complete
        const readmeData = await Promise.all(readmePromises);

        // Combine repository data and readme data into a single response
        const responseData = repositoryData.map((repo, index) => {
            return {
                repository: repo,
                readme: readmeData[index]
            };
        });

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(3005,()=>{
    console.log("Proxy server is running on port 3005")
})


   