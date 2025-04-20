class LLM {
    constructor(endpoint, model, tools = {}) {
        this.endpoint = endpoint;
        this.model = model;
        this.tools = tools;
        this.context = [];
        this.system = null;
        this.format = null;
    }

    setSystemPrompt(args) {
        const { message, format = null } = args;
        this.system = message;
        if (format) {this.format = format;}
    }

    clearSystem() {
        this.system = this.format = null;
    }

    async _callLLM(messages, tool_choice) {
        if (this.system) {messages = [{role: 'system', content: this.system}, ...messages];}
        const requestBody = {
            model: this.model,
            messages: messages,
            stream: false,
        };
        if (tool_choice) requestBody.tool_choice = tool_choice;
        if (Object.keys(this.tools).length > 0) {
            requestBody.tools = Object.values(this.tools).map(tool => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                }
            }));
        }
        if (this.format) {
            requestBody.format = this.format;
        }
        // generate
        const response = await fetch(`${this.endpoint}/api/chat`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) throw new Error(`LLM API error: ${response.statusText}`);
        const data = await response.json();
        return data?.message??(data?.response);
    }

    async aask(userInput) {
        this.context.push({"role": "user", "content": userInput});
        let llmResponse = await this._callLLM(this.context);
        this.context.push(llmResponse);
        while (llmResponse.tool_calls?.length) {
            const newToolMessages = [];
            for (const toolCall of llmResponse.tool_calls) {
                const functionToCall = this.tools[toolCall.function.name];
                if (functionToCall) {
                    try {
                        const result = await functionToCall.execute(JSON.parse(toolCall.function.arguments));
                        newToolMessages.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify(result)});
                    } catch (error) {
                        newToolMessages.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify({error: error.message})});
                    }
                } else {
                    newToolMessages.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify({error: "Tool not found"})});
                }
            }
            this.context.push(...newToolMessages);
            llmResponse = await this._callLLM(this.context);
            this.context.push(llmResponse);
        }
        return llmResponse.content;
    }

    add_tool(toolDefinition) {
        if (toolDefinition.name && toolDefinition.description && toolDefinition.parameters && typeof toolDefinition.execute === 'function') {
            this.tools[toolDefinition.name] = toolDefinition;
        }
    }

    clearContext() {
        this.context = [];
    }

    getContext() {
        return [...this.context];
    }

    async forceToolCall(userInput, toolName, toolArguments) {
        this.context.push({"role": "user", "content": userInput});
        const toolToForce = this.tools[toolName];
        if (!toolToForce) throw new Error(`Tool "${toolName}" not found.`);
        let llmResponse = await this._callLLM(this.context, { name: toolName });
        this.context.push(llmResponse);
        if (llmResponse.tool_calls?.length) {
            const toolCall = llmResponse.tool_calls[0];
            if (toolCall.function.name === toolName) {
                try {
                    const result = await toolToForce.execute(toolArguments);
                    this.context.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify(result)});
                    const finalLlmResponse = await this._callLLM(this.context);
                    this.context.push(finalLlmResponse);
                    return finalLlmResponse.content;
                } catch (error) {
                    this.context.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify({error: error.message})});
                    const finalLlmResponse = await this._callLLM(this.context);
                    this.context.push(finalLlmResponse);
                    return finalLlmResponse.content;
                }
            }
        }
        return llmResponse.content;
    }
}

async function main() {
    const llm = new LLM("http://localhost:11434", "romi"); // llama3.1 | romi | deepseek-r1:1.5b
    llm.add_tool({
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
            type: "object",
            properties: {
                location: { type: "string", description: "The city and state, e.g. San Francisco, CA" },
                unit: { type: "string", enum: ["celsius", "fahrenheit"] }
            },
            required: ["location"]
        },
        execute: async (args) => (args.location.toLowerCase().includes("bashikpur")) ? { temperature: 30, unit: "celsius", description: "Clear sky" } : { temperature: 25, unit: "celsius", description: "Partly cloudy" }
    });
    const response1 = await llm.aask("What's the weather like in Bashikpur?");
    console.log("LLM Response 1:", response1);
    const response2 = await llm.aask("How does that compare to London?");
    console.log("LLM Response 2:", response2);
    const forcedResponse = await llm.forceToolCall("Tell me the weather in Tokyo.", "get_current_weather", { location: "Tokyo, Japan", unit: "fahrenheit" });
    console.log("Forced Tool Call Response:", forcedResponse);
    llm.clearContext();
    const response3 = await llm.aask("What is the capital of France?");
    console.log("LLM Response 3 (new context):", response3);
}
// main().catch(console.error);

class ContentGenerator extends LLM {
    constructor(llmEndpoint, llmModel) {
        super(llmEndpoint, llmModel);
        this.contentType = "post";
        this.promptContext = "";
    }
    setContentType(type) {
        this.contentType = type;
    }
    setPromptContext(context) {
        this.promptContext = context;
    }
    createPostData(title, content, featuredImageId = null, categories = [], tags = []) {
        const postData = {
            title: title,
            content: content,
            status: 'publish',
        };

        if (featuredImageId) {
            postData.featured_media = featuredImageId;
        }
        if (categories && categories.length > 0) {
            postData.categories = categories;
        }
        if (tags && tags.length > 0) {
            postData.tags = tags;
        }
        return postData;
    }
    async uploadMedia(file, restRoot) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const wpResponse = await fetch(`${restRoot}/media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa('admin:password')}`,
                },
                body: formData,
            });

            if (!wpResponse.ok) {
                const errorData = await wpResponse.json();
                console.error('WordPress Media API Error:', errorData);
                throw new Error(`WordPress Media API Error: ${wpResponse.statusText} - ${errorData.message || 'No details'}`);
            }
            const media = await wpResponse.json();
            return media;
        } catch (error) {
            console.error('Error uploading media to WordPress:', error);
            throw error;
        }
    }
    async generateAndCreatePost(title,  restRoot, featuredImage = null, categories = [], tags = []) {
        try {
            const outlinePrompt = this.promptContext + `\n${title}\nCreate a detailed blog post outline with headings and subheadings.  Include specific points and examples to elaborate on each section. Return the outline as a numbered list.`;
            const outline = await this.aask(outlinePrompt);
            console.log("Content Outline:", outline);

            const outlinePoints = outline.split('\n').filter(point => point.trim() !== '' && !point.startsWith('##')).map(point => point.replace(/^\d+\.\s*/, ''));

            let fullContent = "";
            for (const point of outlinePoints) {
                const pointPrompt = this.promptContext + `\nExpand on the following point in detail, providing explanations, examples, and relevant information:\n${point}`;
                const pointContent = await this.aask(pointPrompt);
                fullContent += `\n\n${pointContent}`;
                console.log(`Generated content for point: ${point}`);
            }
            fullContent = "<h2>" + title + "</h2>" + fullContent;

            let featuredImageId = null;
            if (featuredImage) {
                const media = await this.uploadMedia(featuredImage, restRoot);
                featuredImageId = media.id;
                console.log('Uploaded featured image:', media);
            }
            const postData = this.createPostData(title, fullContent, featuredImageId, categories, tags);
            return postData;
        } catch (error) {
            console.error('Error in generateAndCreatePost:', error);
            throw error;
        }
    }
}
class TaskHandler {
    constructor(restRoot, llmEndpoint, llmModel) {
        this.restRoot = restRoot;
        this.contentGenerator = new ContentGenerator(llmEndpoint, llmModel);
        this.task = null;
    }
    async getTask() {
        try {
            const response = await fetch(`${this.restRoot}/partnership/v1/tasks/search`);
            if (!response.ok) {
                throw new Error(`Task API error: ${response.statusText}`);
            }
            const task = await response.json();
            return task;
        } catch (error) {
            console.error('Error fetching task:', error);
            throw error;
        }
    }
    processTask() {
        return new Promise(async (resolve, reject) => {
            try {
                const task = this.task = await this.getTask();
                if (!task || !task.task_type) {
                    console.log('No task available or invalid task format.');
                    return;
                }
                const taskObject = task.task_object;

                switch (task.task_type) {
                    case 'create content':
                            const title = taskObject.title;
                            const context = taskObject.context;
                            this.contentGenerator.setPromptContext(context);
                            const postData = await this.contentGenerator.generateAndCreatePost(title, this.restRoot);
                            console.log('Content generated and post created:', postData);
                            resolve(postData);
                        break;
                    case 'seo_improvements':
                        const post = await fetch(`${this.restRoot}/partnership/v1/post-table/${taskObject?.post_type}/${taskObject?.post_id}`).then(d => d.json()).then(d => JSON.stringify(d));
                        this.contentGenerator.setSystemPrompt({
                            message: `You are an expert SEO Engineer specializing in WordPress and Yoast SEO Pro. Your primary goal is to analyze the provided post data and generate a comprehensive and actionable SEO optimization plan as a structured JSON object. Focus on providing specific and optimized values for all relevant SEO fields, including the slug, meta title, meta description, Open Graph title and description, and Twitter card title and description. Ensure these are compelling and keyword-rich based on thorough keyword research and understanding of the post content. While you should consider Yoast SEO best practices, the priority is to populate these fields with optimized content, not just provide general advice or scores. You should also recommend a canonical URL if necessary and configure the robots meta directives appropriately. Your output MUST be a valid JSON object conforming to the specified schema.`,
                            format: {
                                "type": "object",
                                "properties": {
                                  "slug": {
                                    "type": "string",
                                    "description": "The optimized URL slug for the post."
                                  },
                                  "metadata": {
                                    "type": "object",
                                    "description": "SEO metadata for the post.",
                                    "properties": {
                                      "title": {
                                        "type": "string",
                                        "description": "The optimized meta title."
                                      },
                                      "description": {
                                        "type": "string",
                                        "description": "The optimized meta description."
                                      },
                                      "canonical_url": {
                                        "type": "string",
                                        "description": "The recommended canonical URL (if different)."
                                      },
                                      "robots": {
                                        "type": "object",
                                        "description": "Robots meta directives.",
                                        "properties": {
                                          "index": {
                                            "type": "boolean",
                                            "description": "Should search engines index this page?"
                                          },
                                          "follow": {
                                            "type": "boolean",
                                            "description": "Should search engines follow links on this page?"
                                          },
                                          "advanced": {
                                            "type": "object",
                                            "description": "Advanced robots meta directives.",
                                            "properties": {
                                              "noindex": {
                                                "type": "boolean"
                                              },
                                              "nofollow": {
                                                "type": "boolean"
                                              },
                                              "noarchive": {
                                                "type": "boolean"
                                              },
                                              "nosnippet": {
                                                "type": "boolean"
                                              },
                                              "noodp": {
                                                "type": "boolean"
                                              },
                                              "noydir": {
                                                "type": "boolean"
                                              },
                                              "noimageindex": {
                                                "type": "boolean"
                                              }
                                            }
                                          }
                                        },
                                        "required": [
                                          "index",
                                          "follow",
                                          "advanced"
                                        ]
                                      }
                                    },
                                    "required": [
                                      "title",
                                      "description"
                                    ]
                                  },
                                  "og": {
                                    "type": "object",
                                    "description": "Open Graph meta properties.",
                                    "properties": {
                                      "title": {
                                        "type": "string",
                                        "description": "The optimized Open Graph title."
                                      },
                                      "description": {
                                        "type": "string",
                                        "description": "The optimized Open Graph description."
                                      },
                                      "image": {
                                        "type": "string",
                                        "description": "The recommended Open Graph image URL."
                                      },
                                      "type": {
                                        "type": "string",
                                        "description": "The Open Graph object type (e.g., article)."
                                      }
                                    },
                                    "required": [
                                      "title",
                                      "description",
                                      "type"
                                    ]
                                  },
                                  "twitter": {
                                    "type": "object",
                                    "description": "Twitter Card meta properties.",
                                    "properties": {
                                      "card": {
                                        "type": "string",
                                        "description": "The Twitter card type (e.g., summary_large_image)."
                                      },
                                      "title": {
                                        "type": "string",
                                        "description": "The optimized Twitter title."
                                      },
                                      "description": {
                                        "type": "string",
                                        "description": "The optimized Twitter description."
                                      },
                                      "image": {
                                        "type": "string",
                                        "description": "The recommended Twitter image URL."
                                      }
                                    },
                                    "required": [
                                      "card",
                                      "title",
                                      "description"
                                    ]
                                  },
                                  "schema": {
                                    "type": "object",
                                    "description": "Schema.org markup recommendations.",
                                    "properties": {
                                      "article_type": {
                                        "type": "string",
                                        "description": "The recommended Article schema type (e.g., BlogPosting)."
                                      },
                                      "enable_schema": {
                                        "type": "boolean",
                                        "description": "Should schema.org markup be implemented?"
                                      },
                                      "custom_schema": {
                                        "type": "string",
                                        "description": "Any custom JSON-LD schema to include."
                                      }
                                    }
                                  },
                                  "focus_keyword": {
                                    "type": "string",
                                    "description": "The primary focus keyword for the post."
                                  },
                                  "related_keywords": {
                                    "type": "array",
                                    "description": "A list of semantically related keywords to target.",
                                    "items": {
                                      "type": "string"
                                    }
                                  },
                                  "analysis": {
                                    "type": "object",
                                    "description": "Detailed SEO and readability analysis feedback.",
                                    "properties": {
                                      "overall_score": {
                                        "type": "string",
                                        "description": "An overall SEO score or rating (e.g., Good, Average, Needs Improvement)."
                                      },
                                      "readability": {
                                        "type": "object",
                                        "description": "Readability analysis details.",
                                        "properties": {
                                          "score": {
                                            "type": "string",
                                            "description": "A readability score (e.g., Flesch Reading Ease score)."
                                          },
                                          "feedback": {
                                            "type": "array",
                                            "description": "Specific feedback on readability aspects and how to improve them.",
                                            "items": {
                                              "type": "string"
                                            }
                                          }
                                        },
                                        "required": [
                                          "score",
                                          "feedback"
                                        ]
                                      },
                                      "seo": {
                                        "type": "object",
                                        "description": "Specific SEO analysis feedback.",
                                        "properties": {
                                          "score": {
                                            "type": "string",
                                            "description": "An SEO score or rating."
                                          },
                                          "feedback": {
                                            "type": "array",
                                            "description": "Specific feedback on SEO elements (e.g., keyword density, internal/external linking, image optimization) and how to improve them.",
                                            "items": {
                                              "type": "string"
                                            }
                                          }
                                        },
                                        "required": [
                                          "score",
                                          "feedback"
                                        ]
                                      }
                                    },
                                    "required": [
                                      "readability",
                                      "seo"
                                    ]
                                  },
                                  "advanced": {
                                    "type": "object",
                                    "description": "Advanced SEO settings.",
                                    "properties": {
                                      "redirect_url": {
                                        "type": "string",
                                        "description": "A recommended redirect URL (if needed)."
                                      },
                                      "breadcrumb_title": {
                                        "type": "string",
                                        "description": "The title to use in breadcrumbs."
                                      }
                                    }
                                  }
                                },
                                "required": [
                                  "slug",
                                  "metadata",
                                  "og",
                                  "twitter",
                                  "schema",
                                  "focus_keyword",
                                  "related_keywords",
                                  "analysis"
                                ]
                            }
                        });
                        const response = await this.contentGenerator.aask(`${task?.task_desc??'Post data'}: ${post}`);
                        const response_json = JSON.parse(response);
                        
                        console.log(response_json);
                        resolve(response_json);
                        break;
                    default:
                        console.warn(`Unknown task type: ${task.task_type}`);
                        reject(`Unknown task type: ${task.task_type}`);
                }
            } catch (error) {
                console.error('Error processing content creation task:', error);
                reject(`Error processing content creation task: ${error?.message??''}`);
            }
        });
    }
    submitTask(result) {
        return new Promise(async (resolve, reject) => {
            fetch(`${this.restRoot}/partnership/v1/tasks/submita`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa('admin:password')}`,
                },
                body: JSON.stringify({
                    task: this.task,
                    result: this.result,
                }),
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            throw new Error(`WordPress API error: ${response.statusText} - ${errorData.message || 'No details available'}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    reject(error);
                });
        })
    }
}
const taskHandler = new TaskHandler('https://tools4everyone.local/wp-json', 'http://localhost:11434', 'romi');
taskHandler.processTask().then(async r => await taskHandler.submitTask(r)).catch(console.error);

// 
// taskHandler.contentGenerator.aask('Why the sky blue?');
// 




/**
 * TO update post data
 */
function updatePostData(postType, postId, dataToUpdate) {
    return new Promise(async (resolve, reject) => {
      const apiUrl = `/wp-json/partnership/v1/post-table/${postType}/${postId}`;
  
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToUpdate),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          reject({ success: false, error: errorData });
          return;
        }
  
        const responseData = await response.json();
        resolve({ success: true, data: responseData });
  
      } catch (error) {
        reject({ success: false, error: { message: error.message } });
      }
    });
}

// const updateTitlePayload = {post_title: 'New Updated Title'};
// updatePostData('post', 123, updateTitlePayload).then(response => console.log('Update Success:', response)).catch(error => console.error('Update Error:', error));

// const updateMetaPayload = {meta_input: {custom_field: 'new meta value'}};

// updatePostData('post', 123, updateMetaPayload).then(response => console.log('Meta Update Success:', response)).catch(error => console.error('Meta Update Error:', error));

// const updateContentPayload = {post_content: 'This is the new content of the post.'};

// updatePostData('post', 123, updateContentPayload).then(response => console.log('Content Update Success:', response)).catch(error => console.error('Content Update Error:', error));

// const createPagePayload = {post_title: 'New Page Title',post_content: 'Content of the new page.',post_status: 'draft'};

// updatePostData('page', 0, createPagePayload).then(response => console.log('Create Success:', response)).catch(error => console.error('Create Error:', error));