const API_URL = 'https://strangers-things.herokuapp.com/api/2006-CPU-RM-WEB-PT';

const state = {
  token: '',
  responseObj: {},
  posts: [],
  allPosts: [],
  messages: [],
  id: '',
  user: ''
};


const setToken = (token) => {
  if (state.token) {
    localStorage.setItem('token', JSON.stringify(token))
    token = state.token
  }
};      
    

const getToken = () => {
  return JSON.parse(localStorage.getItem('token'))
};


const renderLogInMessage = () => {
  $('.asideHeader').empty();
  if (state.token && state.token !== null && state.token !== '') {
    $('.asideHeader').prepend(`You are logged in.`)
  }
}; 


const makeHeaders = () => {
  if (state.token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
      }
  } else {
    return {
      'Content-Type': 'application/json',
    }
  }
};


const signUp = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: 
    makeHeaders(),
    body: JSON.stringify({
      user: {
        username: username,
        password: password
      }
    })
    })
    const responseObj = await response.json();
    state.token = responseObj.data && responseObj.data.token;
    setToken(responseObj.data.token)
    $('.accountError').empty()
    $('.accountError').append($(`<p class="message">Your Account was created.<p>`))
  } catch (error) {
    console.error(error)
    $('.accountError').empty()
    $('.accountError').prepend($(`<p class="message">Username not available.<p>`))
  }
};   
    

const logIn = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",         
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    body: JSON.stringify({
      user: {
        username: username,
        password: password
      }
    })
    });
const responseObj = await response.json();
    setToken(responseObj.data.token)
    state.token = responseObj.data.token;
    state.responseObj = responseObj;
    await fetchUserData()
    $('.signOut').css('display', 'inline-block')
    $('.loggingIn').css('display', 'none')
    $('.openYourPosts').css('display', 'inline-block')
    $(' #account-form').addClass('closed')
    $('#new-account-form').removeClass('closed')
    $('.createNewAccount').css('display', 'none')
    populatePosts()
    renderLogInMessage()
  } catch (error) {
    console.error(error)
    state.token = ''
    $('.asideHeader').empty()
    $('.asideHeader').prepend('Username & Password was invalid. You are not logged in.')
    $('.messageList').empty()
    $(`.welcome-message`).empty()
  }
};  
  

$('#new-account-form').on('submit', async function (event){
  event.preventDefault()
  const user = {
    username: $('#new-username').val(),
    password: $('#new-password').val(),
  }
  try {
    const result = await signUp(user.username, user.password)
    fetchUserData()
    $('.asideHeader').empty()
    $('.asideHeader').prepend(`Please log in to start using our services.`)  
    $('#new-account-form').trigger('reset')
    $('#new-account-form').addClass('closed')
    return result
  } catch (error) {
    console.log(error)
  } 
});


$('#account-form').on('submit', async function (event){
  event.preventDefault()
  const user = {
    username: $('#username').val(),
    password: $('#password').val(),
  }
  try {
    const result = await logIn(user.username, user.password)
    fetchUserData()
    populatePosts()
    
    $('#account-form').trigger('reset')
    return result
  } catch (error) {
    console.log(error)
  } 
});


$('.signOut').click(function() {
    logOut()
    $('.messageList').empty()
    $('.asideHeader').empty()
    $('.welcome-message').empty()
    $('.message').empty()
    $('.signOut').hide()
    $('.openYourPosts').hide()
    $('#accountModal').hide()
    $('.loggingIn').css('display', 'inline-block')
    $('.createNewAccount').css('display', 'block')
    populatePosts()
});


const logOut = () => {
  state.token = '';
  state.user = '';
};


const fetchUserData = async () => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    });
    const responseObj = await response.json();
    if (!state.token) {
      return
    }
    if (responseObj.data.username) {
      state.user = responseObj.data.username
      state.id = responseObj.data._id
      state.messages = responseObj.data.messages
      state.posts = responseObj.data.posts
      getToken()
    }
    if (state.token && state.messages.length > 0) {
      $(`.welcome-message`).empty()
      $(`.welcome-message`).append(`Welcome ${state.user}. Here are your Messages.`)
    } else {
      $(`.welcome-message`).empty()
      $(`.welcome-message`).append(`
      Thanks for having an account with us.
      `)
    }
    if (state.token && responseObj.messages) {
      $('.messageList').empty()
      state.messages.forEach(function(message) {
      const messageAppend = $('.messageList').append(renderMessage(message))
      })
    }
  } catch (error) {
    console.error(error)
    $('.asideHeader').empty();
  }
};
          

const readPosts = async () => {
  try {
    const response = await fetch(`${API_URL}/posts`)
    const allData = await response.json()
    state.allPosts = allData.data.posts
    return allData.data;
  } catch (error) {
    console.error(error)
    throw error
  }
};


const populatePosts = async () => {
  try{
    const data = await readPosts()
    $('#posts').empty()
    data.posts.forEach(function (post) {
    $('#posts').prepend(renderPost(post))
    })
  } catch (error) {
    console.error(error)
  }
};

 
const renderPost = (post) => {
  const postDate = new Date(post.createdAt)
  const date = postDate.toDateString()
  const {title, author, description, price, willDeliver, location} = post
  const postElem = $(`
    <div class="post">
      <h3 class="postElementTitle">${title}</h3>
      <span class="postedBy">Seller: ${author.username}</span>
      <span class="date">Date Posted: ${date}</span>
      <p class="description">Description: ${description}</p>
      <span class="price">Price: ${price}</span>
      <span class="delivery">Will Deliver: 
      ${willDeliver ? `Yes` : `No`}</span>
      <span class="location">Location: ${location}</span>
      <footer>
        <div class="button-list">      
          ${state.token && state.user === author.username ? `<button class="edit">Edit</button>` : ''}
          ${state.token && state.user !== author.username ? `<button class="message">Message</button>` : ''}
          ${state.token && state.user === author.username ? `<button class="delete">Delete</button>` : ''}
        </div>
      </footer>
    </div>
    `).data('post', post)
  return postElem
};


$('#post-form').on('submit', async function (event){
  event.preventDefault()
  const newPostData = {
    title: $('#title').val(),
    description: $('#description').val(),
    price: $('#price').val(),
    location: $('#location').val(),
    willDeliver: $('#select').val()
  }
  try {
    const newPost = await createPost(newPostData)
    $('#post-form').trigger('reset')
  } catch (error) {
    console.error(error)
    alert('Unsuccessful post. You must be logged in.')
    $('#post-form').trigger('reset')
  }
});

  
const createPost = async (post) => {
  try {  
    const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: 
    makeHeaders(),
    body: JSON.stringify({post})
    })
    const  newPost = await response.json()
    state.posts.unshift(newPost.data.post)
    state.allPosts.unshift(newPost.data.post)
    $('#posts').prepend(renderPost(newPost.data.post))
    $('#accountModal').prepend(statePoster(newPost.data.post))
    populatePosts()
    return newPost
  } catch (error) {
    throw error
  }
};


$('#posts').on('click', '.delete', async function() {
  const postElement = $(this).closest('.post')
  const post = postElement.data('post')
  try {
    const result = await deletePost(post._id)
    postElement.remove()
    state.allPosts.pop(post)
    state.posts.pop(post)
    populatePosts()
  } catch (error) {
    console.error(error)
  }
});


const deletePost = async (POST_ID) => {
  try {
    const response = await fetch(`${API_URL}/posts/${POST_ID}`, {
    method: "DELETE",
    headers: 
    makeHeaders()
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
};


const createMessage = async (post_Id, content) => {
  try {  
    const response = await fetch(`${API_URL}/posts/${post_Id}/messages`, {
    method: "POST",
    headers: 
    makeHeaders(),
    body: JSON.stringify({message: content})
    })
    const newMessage = await response.json()
    state.messages.unshift(newMessage)
    return newMessage
  } catch (error) {
    throw error
  }
};


$('#posts, .searchList').on('click', '.message', async function () {
  const messageButtonElem = $(this).closest('.post')
  const messageButton = messageButtonElem.data('post')
  const postTitle = messageButton.title
  const postId = messageButton._id
  $('#messageForm').data('postId', postId)
  $('.messageTitleSlot').text(`${postTitle}`)
  $('.messageModal').css('display', 'block')
});


$('.cancelMessage').click (function(event) {
  event.preventDefault()
  $('.messageModal').css('display', 'none')
  $('.messageSender').text('Message for')
});


$('#messageForm').on('submit', async function (event){
  event.preventDefault()
  const postId = $(this).data('postId')
  const message = {
  content: $('#message-description').val(),
  }
  try {
    event.preventDefault()
    const result = await createMessage(postId, message)
    state.messages.push(result)
    fetchUserData() 
    populatePosts()
    $('.messageSender').text(`Message Sent!`)
    $('#messageForm').trigger('reset')
  } catch (error) {
    console.error(error)
  }
});


$('.openYourPosts').on('click', function(){
  renderAccountPostList()
});


const statePoster = (post) => {
  const postDate = new Date(post.createdAt)
  const date = postDate.toDateString()
  const {title, active, willDeliver, description, price, location} = post
  let postElem = $(`
    <div class="accountPosts">
      <h3>Your Post Title: ${title}</h3>
      <p>Date Posted: ${date} </p>
      <span>Active: ${active ? `Yes` : `No`} </span>
      <p>Your Post Description: ${description}</p>
      <span>Your Post Price: ${price}</span>
      <span>Will Deliver: ${willDeliver ? `Yes` : `No`} </span>
      <span>Your Post Location: ${location}</span>
      <div class="accountMessages">
      ${post.messages? post.messages.map(function(message) {
      return `<p class="personal">Message from ${message.fromUser.username}:<span class="quote"> ${message.content}</span></p>`
      }).join('') : '' }
    </div>
    </div>`)
  $('.personal').css('background-color', 'yellow')
  return postElem
}; 


const renderAccountPostList = () => {
  $('.account').empty()
  $('.account').css('display', 'block')
  const modal = $(`<div id="accountModal"></div>`)
  $('.account').append(modal)
  $('#accountModal').empty()
  state.posts.forEach(function(post) {
  const postElem = statePoster (post)
  modal.prepend(postElem)
  })
  modal.prepend($(`
    <p class="close">X CLOSE</p>
    <h1>${state.user}'s Account Posts & Messages</h1>
    <p class="tally">You have ${state.posts.length} posts.</p>
    `))
};


$('.accountInfo').on('click', '.close', function (event) {
  event.preventDefault()
  const close = $(event.target)
  if (close) {
    $('.account').css('display', 'none')
  }
});


const renderMessage = (message) => {
  const {post, fromUser, content} = message
  const messageElem = $(`
  <div class="singleMessageItem">
    <h3>Title: ${post.title}</h3>
    <p>From: ${fromUser.username}</p>
    <p>Message: ${content}</p>
  </div>
  `).data('message', message)
  return messageElem
};


const editPost = async (post) => {
  post._id
  try {
    const response = await fetch(`${API_URL}/posts/${post._id}`, {
      method: 'PATCH',
      headers: 
      makeHeaders(),
      body: JSON.stringify({post})
    });
    const data = await response.json();
  } catch (error) {
    console.error(error)
  }
};


$('#posts').on('click', '.edit', function ( ) {
  const postElement = $(this).closest('.post')
  const post = postElement.data('post')
  $('#edit-form').css('display', 'flex')
  $('#editTitle').val(post.title)
  $('.postEditID').text(post._id)
  $('#editDescription').val(post.description)
  $('#editPrice').val(post.price)
  $('#editLocation').val(post.location)
  $('#editSelect').val(post.willDeliver)
  $('#edit-form').data('updatePost', post)
});


$('#edit-form').on('submit', async function (event){
  event.preventDefault()
  const post = $(this).data('updatePost')
  const postData = {
      _id: $('.postEditID').text(),
      title: $('#editTitle').val(),
      description: $('#editDescription').val(),
      price: $('#editPrice').val(),
      location: $('#editLocation').val(),
      willDeliver: $('#editSelect').val()
  }
  try {
      const result = await editPost(postData)
      populatePosts()
      $('#edit-form').trigger('reset')
      $('.updateNote').empty()
      $('.updateNote').append($(`<span class="updated">Post updated. See main screen to see your updates.</span>`))
      $('.updated').css('color', 'blue')
  } catch (error) {
      console.error(error)
  }
});


$('#edit-form').on('click', '.xclose', function (event) {
  event.preventDefault()
  const close = $(event.target)
  if (close) {
  $('#edit-form').css('display', 'none')
  $('.updateNote').empty()
  }
});


const bootstrap = async () => {
  getToken()
  populatePosts()
};

bootstrap();


$('.loggingIn').click(function() {
  $('#account-form').toggleClass('closed')
});


$('.createNewAccount').click(function() {
  $('#new-account-form').toggleClass('closed')
});


const rectangularSearchBar = () => {
  const navBarElem = $(` 
    <div>
      <form id="rectangularSearchForm">
      <h2>Search</h2>
      <label id="resultList" for="keywords">Search Posts</label>
      <input id="reckeywords" type="textarea" placeholder="enter keywords..." />
      </form> 
    </div>
  `);
  return navBarElem;
};

$('#rectangularSearchBox').append(rectangularSearchBar())


const results = $('header').on('input', '#rectangularSearchForm', function() {
  // event.preventDefault();
  let keyWords = $(this).find('input').val();
  let lowerCaseKeyWords = keyWords.toLowerCase()

  const newPosts = state.allPosts.filter(function (post) {
    if (post.description.toLowerCase().includes(lowerCaseKeyWords) || post.title.toLowerCase().includes(lowerCaseKeyWords) || post.author.username.toLowerCase().includes(lowerCaseKeyWords) || post.price.toLowerCase().includes(lowerCaseKeyWords) || post.location.toLowerCase().includes(lowerCaseKeyWords)) {
    return true
  }
  })
  if (!newPosts) {
    return
  } else {
    $('#resultList').empty()
    $('#resultList').append(`${newPosts ? `${newPosts.length} results`: '0 results'}`)
    $('#posts').empty()
    newPosts.map(function(result) {
    $('#posts').prepend(renderPost(result))
    })
  }    
});


$('.developerName').hover(function(){
  $(this).text("May the Force be with you.");
});