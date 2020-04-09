﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace Gov.Cscp.Victims.Public.Controllers
{
    public class UserSettingsPayload
    {
        public string Message { get; set; }
        public string UserBCeID { get; set; }
        public string BusinessBCeID { get; set; }
    }

    public class LogoutUrlData
    {
        public string LogoutUrl { get; set; }
    }

    [Route("api/[controller]")]
    [Authorize]
    public class UserController : Controller
    {
        private readonly IConfiguration Configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public UserController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            Configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        protected ClaimsPrincipal CurrentUser => _httpContextAccessor.HttpContext.User;

        [HttpGet("current")]
        //[RequiresPermission(Permission.Login, Permission.NewUserRegistration)]
        public virtual IActionResult UsersCurrentGet()
        {
            try
            {
                // determine if we are a new registrant.
                string storedSettingsString = _httpContextAccessor.HttpContext.Session.GetString("UserSettings");
                if (!String.IsNullOrEmpty(storedSettingsString))
                {
                    Authentication.UserSettings userSettings = JsonConvert.DeserializeObject<Authentication.UserSettings>(storedSettingsString);


                    // UserSettingsPayload ret = new UserSettingsPayload {
                    //     Message = "Success",
                    //     UserBCeID = userSettings.UserId,
                    //     BusinessBCeID = userSettings.AccountId
                    // };

                    // return Ok(ret);
                    return StatusCode(200, userSettings);
                }
                else
                {
                    UserSettingsPayload ret = new UserSettingsPayload
                    {
                        Message = "No user settings found",
                        UserBCeID = "",
                        BusinessBCeID = ""
                    };
                    return StatusCode(200, ret);
                }
            }
            catch
            {
                UserSettingsPayload ret = new UserSettingsPayload
                {
                    Message = "Error getting user settings",
                    UserBCeID = "",
                    BusinessBCeID = ""
                };
                return StatusCode(500, ret);
            }
        }

        [HttpGet("GetLogoutUrl")]
        public virtual IActionResult GetLogoutUrl()
        {
            //This is called to perform logout function. We should wipe the session settings and cookie info too.
            try
            {
                HttpContext.Session.Clear();

                //     // Removing Cookies
                CookieOptions option = new CookieOptions();
                if (Request.Cookies[".AspNetCore.Session"] != null)
                {
                    option.Expires = DateTime.Now.AddDays(-1);
                    Response.Cookies.Append(".AspNetCore.Session", "", option);
                }

                if (Request.Cookies["AuthenticationToken"] != null)
                {
                    option.Expires = DateTime.Now.AddDays(-1);
                    Response.Cookies.Append("AuthenticationToken", "", option);
                }

                string logoutPath = "/";
                if (!string.IsNullOrEmpty(Configuration["SITEMINDER_LOGOUT_URL"]))
                {
                    logoutPath = Configuration["SITEMINDER_LOGOUT_URL"];
                    if (!string.IsNullOrEmpty(Configuration["BASE_URI"]) && !string.IsNullOrEmpty(Configuration["BASE_PATH"]))
                    {
                        logoutPath += "?returl=" + Configuration["BASE_URI"] + Configuration["BASE_PATH"];
                    }
                }
                LogoutUrlData ret = new LogoutUrlData
                {
                    LogoutUrl = logoutPath
                };
                return StatusCode(200, ret);
            }
            finally { }
        }
    }
}