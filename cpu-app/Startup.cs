using Gov.Cscp.Victims.Public.Authentication;
using Gov.Cscp.Victims.Public.Authorization;
using Gov.Cscp.Victims.Public.Services;
using Gov.Cscp.Victims.Public.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using NWebsec.AspNetCore.Mvc;
using NWebsec.AspNetCore.Mvc.Csp;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Gov.Cscp.Victims.Public
{
	public class Startup
	{
		public IConfiguration Configuration { get; }
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			// add singleton to allow Controllers to query the Request object
			services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
			services.AddSingleton<IDynamicsResultService, DynamicsResultService>();


			// Add a memory cache
			services.AddMemoryCache();

			// for security reasons, the following headers are set.
			services.AddMvc(opts =>
			{
				// default deny
				var policy = new AuthorizationPolicyBuilder()
				 .RequireAuthenticatedUser()
				 .Build();
				opts.Filters.Add(new AuthorizeFilter(policy));

				opts.Filters.Add(typeof(NoCacheHttpHeadersAttribute));
				opts.Filters.Add(new XRobotsTagAttribute() { NoIndex = true, NoFollow = true });
				opts.Filters.Add(typeof(XContentTypeOptionsAttribute));
				opts.Filters.Add(typeof(XDownloadOptionsAttribute));
				opts.Filters.Add(typeof(XFrameOptionsAttribute));
				opts.Filters.Add(typeof(XXssProtectionAttribute));
				//CSPReportOnly
				opts.Filters.Add(typeof(CspReportOnlyAttribute));
				opts.Filters.Add(new CspScriptSrcReportOnlyAttribute { None = true });

				opts.Filters.Add(new AllowAnonymousFilter()); // Allow anonymous for dev
			})
			.SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
			.AddJsonOptions(
					opts =>
					{
						opts.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
						opts.SerializerSettings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.IsoDateFormat;
						opts.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;

						// ReferenceLoopHandling is set to Ignore to prevent JSON parser issues with the user / roles model.
						opts.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
					});

			// setup siteminder authentication (core 2.0)
			services
			.AddAuthentication(options =>
			{
				options.DefaultAuthenticateScheme = SiteMinderAuthOptions.AuthenticationSchemeName;
				options.DefaultChallengeScheme = SiteMinderAuthOptions.AuthenticationSchemeName;
			})
			.AddSiteminderAuth(options => { });

			// setup authorization
			services.AddAuthorization(options =>
			{
				options.AddPolicy("Business-User", policy =>
				policy.RequireClaim(User.UserTypeClaim, "Business"));
			});
			// end of siteminder section

			services.RegisterPermissionHandler();

			// setup key ring to persist in storage.
			if (!string.IsNullOrEmpty(Configuration["KEY_RING_DIRECTORY"]))
			{
				services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(Configuration["KEY_RING_DIRECTORY"]));
			}

			// In production, the Angular files will be served from this directory
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = "ClientApp/dist";
			});

			// allow for large files to be uploaded
			services.Configure<FormOptions>(options =>
			{
				options.MultipartBodyLengthLimit = 1073741824; // 1 GB
			});

			// health checks
			services.AddHealthChecks(checks =>
			{
				checks.AddValueTaskCheck("HTTP Endpoint", () => new ValueTask<IHealthCheckResult>(HealthCheckResult.Healthy("Ok")));

			});

			services.AddSession();
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
		{
			var log = loggerFactory.CreateLogger("Startup");

			string pathBase = Configuration["BASE_PATH"];

			if (!string.IsNullOrEmpty(pathBase))
			{
				app.UsePathBase(pathBase);
			}
			if (!env.IsProduction())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseExceptionHandler("/Home/Error");
			}

			app.Use(async (ctx, next) =>
			{
				ctx.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
				await next();
			});

			// X-Content-Type-Options header
			app.UseXContentTypeOptions();
			// Referrer-Policy header.
			app.UseReferrerPolicy(opts => opts.NoReferrer());
			// X-Xss-Protection header
			app.UseXXssProtection(options => options.EnabledWithBlockMode());
			// X-Frame-Options header
			app.UseXfo(options => options.Deny());

			if (!env.IsDevelopment())  // when running locally we can't have a strict CSP
			{
				// Content-Security-Policy header
				app.UseCsp(opts =>
				{
					opts
						.BlockAllMixedContent()
						.StyleSources(s => s.Self().UnsafeInline().CustomSources("https://use.fontawesome.com",
								"https://stackpath.bootstrapcdn.com"))
						.FontSources(s => s.Self().CustomSources("https://use.fontawesome.com"))
						.FormActions(s => s.Self())
						.FrameAncestors(s => s.Self())
						.ImageSources(s => s.Self())
						.DefaultSources(s => s.Self())
						.ScriptSources(s => s.Self().CustomSources("https://apis.google.com",
						"https://maxcdn.bootstrapcdn.com",
						"https://cdnjs.cloudflare.com",
						"https://code.jquery.com",
						"https://stackpath.bootstrapcdn.com",
						"https://fonts.googleapis.com"));

				});
			}

			StaticFileOptions staticFileOptions = new StaticFileOptions
			{
				OnPrepareResponse = ctx =>
				{
					ctx.Context.Response.Headers[HeaderNames.CacheControl] = "no-cache, no-store, must-revalidate, private";
					ctx.Context.Response.Headers[HeaderNames.Pragma] = "no-cache";
					ctx.Context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
					ctx.Context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
					ctx.Context.Response.Headers["X-Content-Type-Options"] = "nosniff";
				}
			};

			app.UseStaticFiles(staticFileOptions);
			app.UseSpaStaticFiles(staticFileOptions);

			app.UseNoCacheHttpHeaders();
			// IMPORTANT: This session call MUST go before UseMvc()
			app.UseSession();
			app.UseAuthentication();

			app.UseMvc(routes =>
			{
				routes.MapRoute(
					name: "default",
					template: "{controller}/{action=Index}/{id?}");
			});

			app.UseSpa(spa =>
			{
				// To learn more about options for serving an Angular SPA from ASP.NET Core, see https://go.microsoft.com/fwlink/?linkid=864501
				spa.Options.SourcePath = "ClientApp";

				// Only run the angular CLI Server in Development mode (not staging or test.)
				if (env.IsDevelopment())
				{
					spa.UseAngularCliServer(npmScript: "start");
					spa.Options.StartupTimeout = TimeSpan.FromSeconds(200);
				}
			});
		}
	}
}
