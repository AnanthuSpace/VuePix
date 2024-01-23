const mailer = require("nodemailer")
const { User } = require("../models/userSchema")
const bcrypt = require("bcrypt")



// Login page rendering

const renderLogin = async (req, res) => {
    try {
        if (!req.session.user) {
            res.render("user/userLogin");
        } else {
            res.redirect("/Home")
        }
    } catch (error) {
        res.render("user/userHome")
    }
}


// SignUp page Rendering

const renderSignUp = async (req, res) => {
    try {
        res.render("user/signUp")
    } catch (error) {
        res.redirect("/signup")
    }
}


//generate otp

const generateOTP = () => {
    const otpLength = 6;
    let otp = '';

    for (let i = 0; i < otpLength; i++) {
        const digit = Math.floor(Math.random() * 10);
        otp += digit.toString(); 
    }

    return otp;
};


// userHome page rendering

const renderHome = async (req, res) => {
    try {
        res.render("user/userHome")
    } catch (error) {
        res.redirect("/")
    }
}


// Login and User Verification

const userVerification = async (req, res) => {

    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.render("user/userLogin")
            console.log("Invalid User id and password");
            return;
        }

        console.log(user.username);

        req.session.user = user.username
        res.cookie("sessionId", req.sessionId, { httpOnly: true })
        res.render("user/userHome")

    } catch (error) {
        console.log("Login Error : ", error);
    }
}


// Register the user details and validation

const createUser = async (req, res) => {

    const { username, email, phone, password } = req.body

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Existed username");
            return res.render("user/singUp")
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const otp =generateOTP()


        // Store user datat temporary session

        req.session.tempUser = {
            username,
            email,
            phone,
            password: hashPassword,
            otp
        }


        // Create a transporter with your email service configuration

        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_ID,
              pass: process.env.EMAIL_PASS
            }
          });


        // Set Email options

        const mailOption = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP for Verification is ${otp}`
        }

        // Sending email

        transporter.sendMail(mailOption, (error,info)=>{

            if(error){
                console.error("Mailing error",error);
            }else{
                console.log('Email sent: ' + info.response);
            }

        })
        res.redirect("/otp")
    } catch (error) {
        console.error("Error Creating User : ", error);
    }
}


// Otp Verification
const otpVerification = async (req,res)=>{
    res.render("user/verify")
}


// Handle OTP Submission

const verifyOtp = async (req,res) => {

    const { enteredOtp } = req.body
    const {username, email, phone, password,otp} = req.session.tempUser

    if( enteredOtp != otp){
        console.log("Invalid OTP");
        return res.redirect("/otp")
    }
    try {
        const newUser = new User({
            username,
            email,
            phone,
            password
        })

        await newUser.save();
        console.log("User Creeated Successfully");
        delete req.session.tempUser
        res.redirect("/")

    } catch (error) {
        res.redirect("/otp")
    }
}



// Resend Otp 

const resendOTP = async(req,res)=>{
    try {
        const { email } = req.session.tempUser;

        const newotp = generateOTP()

        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_ID,
              pass: process.env.EMAIL_PASS
            }
          });


        // Set Email options

        const mailOption = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP for Verification is ${newotp}`
        }

        // Sending email

        transporter.sendMail(mailOption, (error,info)=>{

            if(error){
                console.error("Mailing error",error);
            }else{
                console.log('Email sent: ' + info.response);
            }
            res.redirect("/otpVerification")
        })
    } catch (error) {
        res.render("user/verify")
    }
}



// Logout User

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout Error");
            }
            console.log("Logout Successfully");
            res.redirect("/")
        })
    } catch (error) {
        console.log("Logout Error : ", error);
    }
}

module.exports = {
    renderLogin,
    renderSignUp,
    renderHome,
    createUser,
    userVerification,
    otpVerification,
    logout,
    verifyOtp,
    resendOTP,
}