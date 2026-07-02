FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/LlamaDashboard/LlamaDashboard.csproj", "src/LlamaDashboard/"]
RUN dotnet restore "src/LlamaDashboard/LlamaDashboard.csproj"

COPY . .
WORKDIR "/src/src/LlamaDashboard"
RUN dotnet build "LlamaDashboard.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "LlamaDashboard.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:3001
EXPOSE 3001
ENTRYPOINT ["dotnet", "LlamaDashboard.dll"]
