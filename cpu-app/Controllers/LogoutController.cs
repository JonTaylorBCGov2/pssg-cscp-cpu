﻿using System;
// using Gov.Cscp.Victims.Public.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Gov.Cscp.Victims.Public.Controllers
{
	[Route("[controller]")]
	public class LogoutController : Controller
	{
		// **********FROM PILL PRESS *****************

		// private readonly IConfiguration Configuration;
		// private readonly IHostingEnvironment _env;
		// private readonly SiteMinderAuthOptions _options = new SiteMinderAuthOptions();

		// public LogoutController( IConfiguration configuration, IHostingEnvironment env)
		// {
		//     Configuration = configuration;
		//     _env = env;      
		// }

		// [HttpGet]
		// [AllowAnonymous]
		// public ActionResult Logout(string path)
		// {            
		//     // clear session
		//     HttpContext.Session.Clear();

		//     // Removing Cookies
		//     CookieOptions option = new CookieOptions();
		//     if (Request.Cookies[".AspNetCore.Session"] != null)
		//     {
		//         option.Expires = DateTime.Now.AddDays(-1);
		//         Response.Cookies.Append(".AspNetCore.Session", "", option);
		//     }

		//     if (Request.Cookies["AuthenticationToken"] != null)
		//     {
		//         option.Expires = DateTime.Now.AddDays(-1);
		//         Response.Cookies.Append("AuthenticationToken", "", option);
		//     }

		//     if (! _env.IsProduction()) // clear dev tokens
		//     {
		//         string temp = HttpContext.Request.Cookies[_options.DevAuthenticationTokenKey];
		//         if (temp == null)
		//         {
		//             temp = "";
		//         }
		//         // expire "dev" user cookie
		//         Response.Cookies.Append(
		//             _options.DevAuthenticationTokenKey,
		//             temp,
		//             new CookieOptions
		//             {
		//                 Path = "/",
		//                 SameSite = SameSiteMode.None,
		//                 Expires = DateTime.UtcNow.AddDays(-1)
		//             }
		//         );
		//         // expire "dev" user cookie
		//         temp = HttpContext.Request.Cookies[_options.DevBCSCAuthenticationTokenKey];
		//         if (temp == null)
		//         {
		//             temp = "";
		//         }
		//         Response.Cookies.Append(
		//             _options.DevBCSCAuthenticationTokenKey,
		//             temp,
		//             new CookieOptions
		//             {
		//                 Path = "/",
		//                 SameSite = SameSiteMode.None,
		//                 Expires = DateTime.UtcNow.AddDays(-1)
		//             }
		//         );

		//     }

		//     string logoutPath = string.IsNullOrEmpty(Configuration["SITEMINDER_LOGOUT_URL"]) ? "/" : Configuration["SITEMINDER_LOGOUT_URL"];
		//     return Redirect(logoutPath + $"?returl={Configuration["BASE_URI"]}{Configuration["BASE_PATH"]}&retnow=1");
		// }
	}
}
